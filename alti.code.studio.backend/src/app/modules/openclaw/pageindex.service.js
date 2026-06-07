/**
 * Copyright (c) 2024 Inso Code
 *
 * PAGEINDEX SERVICE — Vectorless Reasoning RAG
 * Integrates VectifyAI/PageIndex for document indexing and reasoning-based retrieval.
 * MIT License — https://github.com/VectifyAI/PageIndex
 *
 * PageIndex allows LLMs to reason over documents at the page level
 * without embedding vectors — making it fast, cheap, and citation-rich.
 */

import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';

const execFileAsync = promisify(execFile);
const PAGEINDEX_BASE = path.resolve('submodules', 'pageindex');

class PageIndexService {
    constructor() {
        this.basePath = PAGEINDEX_BASE;
        this._available = null;
    }

    isAvailable() {
        if (this._available === null) {
            this._available = fs.existsSync(path.join(this.basePath, 'pyproject.toml')) ||
                fs.existsSync(path.join(this.basePath, 'requirements.txt'));
            if (!this._available) {
                logger.warn('[pageindex] Submodule not initialized.');
            }
        }
        return this._available;
    }

    /**
     * Index a document using PageIndex (vectorless, LLM-native page-level indexing).
     * @param {string} docPath - Path to the document to index
     * @param {string} [indexId] - Optional custom index identifier
     * @returns {Promise<{ status: string, indexId: string, pages: number }>}
     */
    async indexDocument(docPath, indexId = null) {
        if (!this.isAvailable()) {
            return { status: 'unavailable', message: 'PageIndex submodule not initialized.' };
        }

        if (!fs.existsSync(docPath)) {
            throw new Error(`[pageindex] Document not found: ${docPath}`);
        }

        const args = ['-m', 'pageindex.cli', 'index', '--input', docPath];
        if (indexId) args.push('--index-id', indexId);

        logger.info(`[pageindex] Indexing document: ${path.basename(docPath)}`);
        const { stdout } = await execFileAsync('python', args, {
            cwd: this.basePath,
            timeout: 120000,
            env: { ...process.env, PYTHONPATH: this.basePath },
        });

        const result = JSON.parse(stdout.trim());
        logger.info(`[pageindex] Indexed ${result.pages || '?'} pages`);
        return result;
    }

    /**
     * Query an indexed document using reasoning-based retrieval.
     * @param {string} query - The question or query
     * @param {string} indexId - The index to query
     * @param {object} opts - { topK, citePage }
     * @returns {Promise<{ answer: string, citations: Array, pages: Array }>}
     */
    async query(query, indexId, opts = {}) {
        if (!this.isAvailable()) {
            return { status: 'unavailable', answer: '', citations: [] };
        }

        const args = [
            '-m', 'pageindex.cli', 'query',
            '--query', query,
            '--index-id', indexId,
        ];
        if (opts.topK) args.push('--top-k', String(opts.topK));
        if (opts.citePage) args.push('--cite-page');

        logger.info(`[pageindex] Querying index "${indexId}": "${query.slice(0, 80)}"`);
        const { stdout } = await execFileAsync('python', args, {
            cwd: this.basePath,
            timeout: 60000,
            env: { ...process.env, PYTHONPATH: this.basePath },
        });

        return JSON.parse(stdout.trim());
    }

    /**
     * Index + immediately query a document in one step.
     * Great for ad-hoc document Q&A.
     * @param {string} docPath - Path to the document
     * @param {string} query - The query
     */
    async indexAndQuery(docPath, query, opts = {}) {
        const indexed = await this.indexDocument(docPath);
        if (indexed.status === 'unavailable') return indexed;
        const indexId = indexed.indexId || path.basename(docPath, path.extname(docPath));
        return this.query(query, indexId, opts);
    }

    /**
     * List all indexed documents.
     */
    async listIndexes() {
        if (!this.isAvailable()) return [];
        try {
            const { stdout } = await execFileAsync('python', ['-m', 'pageindex.cli', 'list'], {
                cwd: this.basePath,
                timeout: 15000,
                env: { ...process.env, PYTHONPATH: this.basePath },
            });
            return JSON.parse(stdout.trim());
        } catch {
            return [];
        }
    }

    getCapabilities() {
        return {
            name: 'PageIndex',
            description: 'Vectorless, reasoning-based RAG — page-level document indexing',
            features: [
                'No vector database required',
                'LLM-native page-level reasoning',
                'Rich citation with page provenance',
                'Ad-hoc document Q&A',
                'Structured knowledge extraction',
            ],
            available: this.isAvailable(),
        };
    }
}

export const pageIndexService = new PageIndexService();
