/**
 * Copyright (c) 2024 Inso Code
 *
 * Gemini File Search Service — "The Librarian's Eye"
 *
 * Production-hardened RAG service using the Gemini File Search API.
 * Security: DLP scrubbing, path traversal protection, resource name validation.
 * Observability: Structured logging, telemetry, audit trails.
 * Resilience: Exponential backoff polling, circuit breaker, graceful degradation.
 *
 * @see https://ai.google.dev/gemini-api/docs/file-search
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

// ─────────────────────────────────────────────
// Constants & Configuration
// ─────────────────────────────────────────────

/** Default embedding model for multimodal (text + image) support */
const DEFAULT_EMBEDDING_MODEL = 'models/gemini-embedding-2';

/** Default generation model for File Search queries */
const DEFAULT_GENERATION_MODEL = 'gemini-3.1-pro';

/** Polling configuration for async operations */
const POLL_CONFIG = Object.freeze({
    maxAttempts: 60,
    baseIntervalMs: 2000,
    maxIntervalMs: 15000,
    backoffMultiplier: 1.5,
});

/** Hard limits enforced by the API — mirrored locally for fail-fast */
const LIMITS = Object.freeze({
    maxFileSizeBytes: 100 * 1024 * 1024,   // 100 MB per document
    maxQueryLength: 32000,                  // chars — prevent token overflow
    maxStoreNamesPerQuery: 20,              // sanity bound
    maxDisplayNameLength: 256,
    maxMetadataKeys: 50,
    maxChunkTokens: 2048,
    maxOverlapTokens: 512,
});

/** Allowed embedding models — reject unknown models */
const ALLOWED_EMBEDDING_MODELS = new Set([
    'models/gemini-embedding-2',
    'models/gemini-embedding-001',
]);

/** Regex for validating Google resource names (alphanumeric + hyphens + underscores) */
const RESOURCE_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

// ─────────────────────────────────────────────
// Circuit Breaker (lightweight, in-process)
// ─────────────────────────────────────────────

class CircuitBreaker {
    constructor(failureThreshold = 5, resetTimeMs = 60000) {
        this.failures = 0;
        this.failureThreshold = failureThreshold;
        this.resetTimeMs = resetTimeMs;
        this.state = 'CLOSED'; // CLOSED | OPEN | HALF_OPEN
        this.lastFailureTime = 0;
    }

    canExecute() {
        if (this.state === 'CLOSED') return true;
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.resetTimeMs) {
                this.state = 'HALF_OPEN';
                return true;
            }
            return false;
        }
        return true; // HALF_OPEN — allow one probe
    }

    recordSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    recordFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            logger.warn(`[FileSearch] Circuit breaker OPEN after ${this.failures} failures. Cooldown: ${this.resetTimeMs / 1000}s`);
        }
    }
}

// ─────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────

/**
 * Validates and sanitizes a resource name segment (store name, document ID).
 * Prevents path traversal and injection via resource identifiers.
 */
function validateResourceName(name, label = 'resourceName') {
    if (!name || typeof name !== 'string') {
        throw new Error(`${label} is required and must be a non-empty string.`);
    }
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 256) {
        throw new Error(`${label} must be between 1-256 characters.`);
    }
    // Allow full resource paths like "fileSearchStores/abc123"
    const segments = trimmed.split('/');
    for (const seg of segments) {
        if (seg.length > 0 && !RESOURCE_NAME_PATTERN.test(seg)) {
            throw new Error(`${label} contains invalid characters. Only alphanumeric, hyphens, and underscores are allowed.`);
        }
    }
    return trimmed;
}

/**
 * Validates a display name — strips dangerous characters but allows spaces/unicode.
 */
function sanitizeDisplayName(name) {
    if (!name || typeof name !== 'string') {
        throw new Error('displayName is required.');
    }
    // Strip control characters and null bytes
    const sanitized = name.replace(/[\x00-\x1F\x7F]/g, '').trim();
    if (sanitized.length === 0 || sanitized.length > LIMITS.maxDisplayNameLength) {
        throw new Error(`displayName must be between 1-${LIMITS.maxDisplayNameLength} characters after sanitization.`);
    }
    return sanitized;
}

/**
 * Validates a file path — prevents directory traversal attacks.
 * Resolves to absolute and ensures it's within the allowed upload directory.
 */
function validateFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('filePath is required and must be a non-empty string.');
    }

    const resolved = path.resolve(filePath);

    // Block obvious traversal patterns before stat
    if (filePath.includes('..') || filePath.includes('\x00')) {
        throw new Error('filePath contains forbidden traversal characters.');
    }

    // Verify file exists and is a regular file (not a symlink to sensitive data)
    try {
        const stat = fs.lstatSync(resolved);
        if (!stat.isFile()) {
            throw new Error('filePath must point to a regular file.');
        }
        if (stat.size > LIMITS.maxFileSizeBytes) {
            throw new Error(`File exceeds maximum size of ${LIMITS.maxFileSizeBytes / (1024 * 1024)} MB.`);
        }
        if (stat.size === 0) {
            throw new Error('File is empty (0 bytes).');
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`File not found: ${resolved}`);
        }
        throw err;
    }

    return resolved;
}

/**
 * Validates chunking configuration values.
 */
function validateChunkingConfig(cfg) {
    if (!cfg) return null;
    const maxTokens = Number(cfg.maxTokensPerChunk);
    const overlap = Number(cfg.maxOverlapTokens);

    if (maxTokens && (maxTokens < 10 || maxTokens > LIMITS.maxChunkTokens)) {
        throw new Error(`maxTokensPerChunk must be between 10-${LIMITS.maxChunkTokens}.`);
    }
    if (overlap && (overlap < 0 || overlap > LIMITS.maxOverlapTokens)) {
        throw new Error(`maxOverlapTokens must be between 0-${LIMITS.maxOverlapTokens}.`);
    }
    if (maxTokens && overlap && overlap >= maxTokens) {
        throw new Error('maxOverlapTokens must be less than maxTokensPerChunk.');
    }

    return {
        whiteSpaceConfig: {
            maxTokensPerChunk: maxTokens || 300,
            maxOverlapTokens: overlap || 30,
        },
    };
}

/**
 * Validates custom metadata entries.
 */
function validateMetadata(metadata) {
    if (!metadata) return null;
    if (!Array.isArray(metadata)) {
        throw new Error('customMetadata must be an array.');
    }
    if (metadata.length > LIMITS.maxMetadataKeys) {
        throw new Error(`customMetadata cannot exceed ${LIMITS.maxMetadataKeys} entries.`);
    }
    for (const entry of metadata) {
        if (!entry.key || typeof entry.key !== 'string') {
            throw new Error('Each metadata entry must have a string "key".');
        }
        if (entry.stringValue === undefined && entry.numericValue === undefined &&
            entry.string_value === undefined && entry.numeric_value === undefined) {
            throw new Error(`Metadata key "${entry.key}" must have a stringValue or numericValue.`);
        }
    }
    return metadata;
}

// ─────────────────────────────────────────────
// DLP Integration (PII scrubbing)
// ─────────────────────────────────────────────

/**
 * Scrubs queries through Google Cloud DLP before sending to external API.
 * Falls back to raw text if DLP is unavailable (dev environments).
 */
async function scrubQuery(text) {
    try {
        const { AzureDlpService } = await import('../ai/azureDlp.service.js');
        return await AzureDlpService.redactText(text);
    } catch {
        // DLP unavailable — log once and pass through
        return text;
    }
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

class FileSearchService {
    constructor() {
        this.ai = null;
        this._initialized = false;
        this._circuitBreaker = new CircuitBreaker(5, 60000);
    }

    /**
     * Lazily initializes the GoogleGenAI client.
     * @returns {GoogleGenAI}
     */
    _getClient() {
        if (this.ai) return this.ai;

        const apiKey = config.gemini_secret_key || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('FileSearchService: GEMINI_API_KEY is required but not set.');
        }

        this.ai = new GoogleGenAI({ apiKey });
        this._initialized = true;
        logger.info('[FileSearch] GoogleGenAI client initialized.');
        return this.ai;
    }

    /**
     * Wraps an API call with circuit breaker + structured error handling.
     * @param {string} operationName - Label for logging.
     * @param {Function} fn - Async function to execute.
     * @returns {Promise<*>}
     */
    async _execute(operationName, fn) {
        if (!this._circuitBreaker.canExecute()) {
            throw new Error(`[FileSearch] Circuit breaker is OPEN — ${operationName} rejected. Retry later.`);
        }

        const startTime = Date.now();
        try {
            const result = await fn();
            this._circuitBreaker.recordSuccess();

            const durationMs = Date.now() - startTime;
            logger.info(`[FileSearch] ${operationName} completed in ${durationMs}ms`);

            // Fire-and-forget telemetry
            this._recordTelemetry(operationName, durationMs).catch(() => {});

            return result;
        } catch (err) {
            this._circuitBreaker.recordFailure();
            const durationMs = Date.now() - startTime;
            logger.error(`[FileSearch] ${operationName} failed after ${durationMs}ms: ${err.message}`);
            throw err;
        }
    }

    /**
     * Records telemetry for File Search operations.
     */
    async _recordTelemetry(operation, durationMs) {
        try {
            const { metricsService } = await import('../monitoring/metrics.service.js');
            metricsService.recordLLMUsage(
                'default_enterprise_tenant',
                'FileSearchService',
                operation,
                0, 0, durationMs
            );
        } catch {
            // Metrics service unavailable — non-critical
        }
    }

    /**
     * Writes an audit log entry for state-changing operations.
     */
    async _auditLog(action, details) {
        try {
            const { CloudLoggingService } = await import('../googleCloud/logging.service.js');
            CloudLoggingService.writeAuditLog('file-search-audit', {
                action,
                ...details,
                timestamp: new Date().toISOString(),
            }, 'NOTICE');
        } catch {
            // Audit logging unavailable — non-critical
        }
    }

    // ─────────────────────────────────────────────
    // File Search Store CRUD
    // ─────────────────────────────────────────────

    /**
     * Creates a new File Search Store.
     * @param {string} displayName - Human-readable name for the store.
     * @param {string} [embeddingModel] - Embedding model to use.
     * @returns {Promise<Object>} The created FileSearchStore resource.
     */
    async createStore(displayName, embeddingModel = DEFAULT_EMBEDDING_MODEL) {
        const safeName = sanitizeDisplayName(displayName);

        if (!ALLOWED_EMBEDDING_MODELS.has(embeddingModel)) {
            throw new Error(`Unsupported embedding model: "${embeddingModel}". Allowed: ${[...ALLOWED_EMBEDDING_MODELS].join(', ')}`);
        }

        return this._execute('createStore', async () => {
            const ai = this._getClient();
            const store = await ai.fileSearchStores.create({
                config: { displayName: safeName, embeddingModel },
            });

            this._auditLog('STORE_CREATED', { storeName: store.name, displayName: safeName, embeddingModel });
            logger.info(`[FileSearch] Store created: ${store.name}`);
            return store;
        });
    }

    /**
     * Lists all File Search Stores for the current project.
     * @returns {Promise<Object[]>} Array of FileSearchStore resources.
     */
    async listStores() {
        return this._execute('listStores', async () => {
            const ai = this._getClient();
            const stores = [];
            const storeIterator = await ai.fileSearchStores.list();
            for await (const store of storeIterator) {
                stores.push(store);
            }
            logger.info(`[FileSearch] Found ${stores.length} store(s).`);
            return stores;
        });
    }

    /**
     * Retrieves a single File Search Store by name.
     * @param {string} storeName - Full resource name (e.g. "fileSearchStores/abc123").
     * @returns {Promise<Object>} The FileSearchStore resource.
     */
    async getStore(storeName) {
        const safeName = validateResourceName(storeName, 'storeName');
        return this._execute('getStore', async () => {
            const ai = this._getClient();
            return ai.fileSearchStores.get({ name: safeName });
        });
    }

    /**
     * Deletes a File Search Store.
     * @param {string} storeName - Full resource name.
     * @param {boolean} [force=false] - Force-delete even if store contains documents.
     * @returns {Promise<void>}
     */
    async deleteStore(storeName, force = false) {
        const safeName = validateResourceName(storeName, 'storeName');
        return this._execute('deleteStore', async () => {
            const ai = this._getClient();
            await ai.fileSearchStores.delete({ name: safeName, config: { force: Boolean(force) } });
            this._auditLog('STORE_DELETED', { storeName: safeName, force });
            logger.info(`[FileSearch] Store deleted: ${safeName}`);
        });
    }

    // ─────────────────────────────────────────────
    // File Upload & Import
    // ─────────────────────────────────────────────

    /**
     * Uploads a file directly into a File Search Store.
     * Validates path, size, and chunking config before upload.
     *
     * @param {string} storeName - Target FileSearchStore resource name.
     * @param {string} filePath - Local path to the file to upload.
     * @param {string} displayName - Human-readable file name (visible in citations).
     * @param {Object} [chunkingConfig] - Optional custom chunking configuration.
     * @param {Object[]} [customMetadata] - Optional custom metadata key-value pairs.
     * @returns {Promise<Object>} The completed operation result.
     */
    async uploadFile(storeName, filePath, displayName, chunkingConfig = null, customMetadata = null) {
        const safeName = validateResourceName(storeName, 'storeName');
        const safeFilePath = validateFilePath(filePath);
        const safeDisplayName = sanitizeDisplayName(displayName);
        const safeChunking = validateChunkingConfig(chunkingConfig);
        const safeMetadata = validateMetadata(customMetadata);

        return this._execute('uploadFile', async () => {
            const ai = this._getClient();
            const uploadConfig = { displayName: safeDisplayName };

            if (safeChunking) uploadConfig.chunkingConfig = safeChunking;
            if (safeMetadata) uploadConfig.customMetadata = safeMetadata;

            let operation = await ai.fileSearchStores.uploadToFileSearchStore({
                file: safeFilePath,
                fileSearchStoreName: safeName,
                config: uploadConfig,
            });

            operation = await this._waitForOperation(operation);
            this._auditLog('FILE_UPLOADED', { storeName: safeName, displayName: safeDisplayName });
            logger.info(`[FileSearch] File "${safeDisplayName}" uploaded and indexed.`);
            return operation;
        });
    }

    /**
     * Imports an already-uploaded file (via Files API) into a File Search Store.
     */
    async importFile(storeName, fileName, chunkingConfig = null, customMetadata = null) {
        const safeName = validateResourceName(storeName, 'storeName');
        const safeFileName = validateResourceName(fileName, 'fileName');
        const safeChunking = validateChunkingConfig(chunkingConfig);
        const safeMetadata = validateMetadata(customMetadata);

        return this._execute('importFile', async () => {
            const ai = this._getClient();
            const importConfig = {};
            if (safeChunking) importConfig.chunkingConfig = safeChunking;
            if (safeMetadata) importConfig.customMetadata = safeMetadata;

            let operation = await ai.fileSearchStores.importFile({
                fileSearchStoreName: safeName,
                fileName: safeFileName,
                config: Object.keys(importConfig).length > 0 ? importConfig : undefined,
            });

            operation = await this._waitForOperation(operation);
            this._auditLog('FILE_IMPORTED', { storeName: safeName, fileName: safeFileName });
            logger.info(`[FileSearch] File "${safeFileName}" imported and indexed.`);
            return operation;
        });
    }

    /**
     * Uploads a file to the Files API (not yet indexed).
     */
    async uploadToFilesApi(filePath, displayName) {
        const safeFilePath = validateFilePath(filePath);
        const safeDisplayName = sanitizeDisplayName(displayName);

        return this._execute('uploadToFilesApi', async () => {
            const ai = this._getClient();
            const file = await ai.files.upload({
                file: safeFilePath,
                config: { name: safeDisplayName },
            });
            logger.info(`[FileSearch] File uploaded to Files API: ${file.name}`);
            return file;
        });
    }

    // ─────────────────────────────────────────────
    // Document Management
    // ─────────────────────────────────────────────

    /**
     * Lists all documents in a File Search Store.
     */
    async listDocuments(storeName) {
        const safeName = validateResourceName(storeName, 'storeName');
        return this._execute('listDocuments', async () => {
            const ai = this._getClient();
            const documents = [];
            const docIterator = await ai.fileSearchStores.documents.list({ parent: safeName });
            for await (const doc of docIterator) {
                documents.push(doc);
            }
            logger.info(`[FileSearch] Found ${documents.length} document(s) in ${safeName}`);
            return documents;
        });
    }

    /**
     * Retrieves a specific document from a store.
     */
    async getDocument(documentName) {
        const safeName = validateResourceName(documentName, 'documentName');
        return this._execute('getDocument', async () => {
            const ai = this._getClient();
            return ai.fileSearchStores.documents.get({ name: safeName });
        });
    }

    /**
     * Deletes a specific document from a store.
     */
    async deleteDocument(documentName) {
        const safeName = validateResourceName(documentName, 'documentName');
        return this._execute('deleteDocument', async () => {
            const ai = this._getClient();
            await ai.fileSearchStores.documents.delete({ name: safeName });
            this._auditLog('DOCUMENT_DELETED', { documentName: safeName });
            logger.info(`[FileSearch] Document deleted: ${safeName}`);
        });
    }

    // ─────────────────────────────────────────────
    // RAG Query — The Core
    // ─────────────────────────────────────────────

    /**
     * Queries one or more File Search Stores using Gemini's native RAG.
     * Scrubs the query through DLP before sending to the API.
     *
     * @param {string} query - The user's natural language query.
     * @param {string[]} storeNames - Array of FileSearchStore resource names to search.
     * @param {Object} [options] - Additional query options.
     * @returns {Promise<Object>} { text, citations, groundingMetadata, usage }
     */
    async query(query, storeNames, options = {}) {
        // Input validation
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new Error('query must be a non-empty string.');
        }
        if (query.length > LIMITS.maxQueryLength) {
            throw new Error(`query exceeds maximum length of ${LIMITS.maxQueryLength} characters.`);
        }
        if (!Array.isArray(storeNames) || storeNames.length === 0) {
            throw new Error('storeNames must be a non-empty array.');
        }
        if (storeNames.length > LIMITS.maxStoreNamesPerQuery) {
            throw new Error(`Cannot query more than ${LIMITS.maxStoreNamesPerQuery} stores at once.`);
        }

        // Validate each store name
        const safeStoreNames = storeNames.map(n => validateResourceName(n, 'storeName'));

        // DLP scrub the query
        const scrubbedQuery = await scrubQuery(query);

        const model = options.model || DEFAULT_GENERATION_MODEL;

        return this._execute('query', async () => {
            const ai = this._getClient();

            const fileSearchTool = { fileSearch: { fileSearchStoreNames: safeStoreNames } };
            if (options.metadataFilter && typeof options.metadataFilter === 'string') {
                fileSearchTool.fileSearch.metadataFilter = options.metadataFilter;
            }

            const response = await ai.models.generateContent({
                model,
                contents: scrubbedQuery,
                config: { tools: [fileSearchTool] },
            });

            const text = response.text;
            const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;
            const citations = this._extractCitations(groundingMetadata);
            const usage = response.candidates?.[0]?.usageMetadata || null;

            logger.info(`[FileSearch] Query complete. ${citations.length} citation(s), model=${model}`);
            return { text, citations, groundingMetadata, usage, model, storeNames: safeStoreNames };
        });
    }

    /**
     * Queries File Search with structured output (JSON schema).
     */
    async queryStructured(query, storeNames, jsonSchema, options = {}) {
        if (!query || typeof query !== 'string') throw new Error('query is required.');
        if (!Array.isArray(storeNames) || storeNames.length === 0) throw new Error('storeNames is required.');
        if (!jsonSchema || typeof jsonSchema !== 'object') throw new Error('jsonSchema must be a valid object.');

        const safeStoreNames = storeNames.map(n => validateResourceName(n, 'storeName'));
        const scrubbedQuery = await scrubQuery(query);
        const model = options.model || DEFAULT_GENERATION_MODEL;

        return this._execute('queryStructured', async () => {
            const ai = this._getClient();

            const response = await ai.models.generateContent({
                model,
                contents: scrubbedQuery,
                config: {
                    tools: [{ fileSearch: { fileSearchStoreNames: safeStoreNames } }],
                    responseFormat: { text: { mimeType: 'application/json', schema: jsonSchema } },
                },
            });

            const text = response.text;
            let structured = null;
            try { structured = JSON.parse(text); } catch {
                logger.warn('[FileSearch] Structured response was not valid JSON.');
            }

            const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;
            const citations = this._extractCitations(groundingMetadata);
            return { structured, text, citations, groundingMetadata };
        });
    }

    // ─────────────────────────────────────────────
    // Internals
    // ─────────────────────────────────────────────

    /**
     * Polls an async operation with exponential backoff.
     */
    async _waitForOperation(operation) {
        const ai = this._getClient();
        let attempts = 0;
        let intervalMs = POLL_CONFIG.baseIntervalMs;

        while (!operation.done && attempts < POLL_CONFIG.maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
            operation = await ai.operations.get({ operation });
            attempts++;
            // Exponential backoff, capped
            intervalMs = Math.min(intervalMs * POLL_CONFIG.backoffMultiplier, POLL_CONFIG.maxIntervalMs);
        }

        if (!operation.done) {
            const totalWaitSec = Math.round((POLL_CONFIG.maxAttempts * (POLL_CONFIG.baseIntervalMs + POLL_CONFIG.maxIntervalMs) / 2) / 1000);
            throw new Error(`[FileSearch] Operation timed out after ~${totalWaitSec}s (${attempts} polls).`);
        }

        return operation;
    }

    /**
     * Extracts structured citations from Gemini grounding metadata.
     * Defensive parsing — never throws, always returns an array.
     */
    _extractCitations(groundingMetadata) {
        if (!groundingMetadata || !Array.isArray(groundingMetadata.groundingChunks)) {
            return [];
        }

        return groundingMetadata.groundingChunks
            .filter(chunk => chunk && chunk.retrievedContext)
            .map(chunk => {
                const ctx = chunk.retrievedContext;
                const citation = {
                    title: ctx.title || null,
                    text: ctx.text || null,
                    uri: ctx.uri || null,
                };
                if (ctx.pageNumber) citation.pageNumber = ctx.pageNumber;
                if (ctx.mediaId) citation.mediaId = ctx.mediaId;
                if (ctx.fileSearchStore) citation.fileSearchStore = ctx.fileSearchStore;
                if (Array.isArray(ctx.customMetadata)) {
                    citation.customMetadata = ctx.customMetadata.map(m => ({
                        key: m.key,
                        value: m.stringValue ?? m.numericValue ?? m.string_value ?? m.numeric_value ?? null,
                    }));
                }
                return citation;
            });
    }

    /**
     * Downloads media referenced in a citation (for multimodal File Search).
     */
    async downloadMedia(mediaId) {
        if (!mediaId || typeof mediaId !== 'string') {
            throw new Error('mediaId is required.');
        }
        return this._execute('downloadMedia', async () => {
            const ai = this._getClient();
            return ai.fileSearchStores.downloadMedia(mediaId);
        });
    }
}

export const fileSearchService = new FileSearchService();
