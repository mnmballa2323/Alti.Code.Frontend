/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { vertexService } from '../ai/vertex.service.js';
import { logger } from '../../../shared/logger.js';
import { vectorStoreService } from './vector.store.js';
import { magikaService } from '../agents/magika.service.js';
import { GoogleDlpService } from '../googleCloud/dlp.service.js';
import { sccService } from '../googleCloud/scc.service.js';
import { vertexVectorSearch } from '../googleCloud/vectorSearch.service.js';
import { documentAiService } from '../googleCloud/document_ai.service.js';
import { visionService } from '../googleCloud/vision.service.js';
import { GcsService } from '../googleCloud/gcs.service.js';
import fs from 'fs';
import path from 'path';
import { AgentMemoryHooks } from './agentmemory.hooks.js';

/** Maximum number of documents to index concurrently. */
const BATCH_SIZE = 8;

class RagService {
  /**
   * Create an index from a list of text content.
   * Documents are processed in parallel batches for throughput.
   *
   * @param {string[]} texts
   * @param {object}   [meta]  - Extra metadata to attach to every chunk
   * @param {string}   [tenantId]
   */
  async createIndex(texts, meta = {}, tenantId) {
    if (!Array.isArray(texts) || texts.length === 0) {
      logger.warn(
        '📚 RAG: createIndex() called with empty or invalid texts array.',
      );
      return;
    }

    logger.info(
      `📚 RAG: Indexing ${texts.length} document(s) into Enterprise Memory...`,
    );

    let indexed = 0;
    let skipped = 0;

    // Process in batches to avoid overwhelming the vector store
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (text, idx) => {
          if (!text || typeof text !== 'string' || text.trim().length === 0) {
            skipped++;
            return;
          }
          try {
            // ZERO-TRUST RAG STEP 1: Audit chunk for critical PII / API Key leakage
            const findings = await GoogleDlpService.inspectText(text);
            if (findings && findings.length > 0) {
              for (const finding of findings) {
                // Elevate severe hardcoded secrets natively to Google Security Command Center
                await sccService.reportFinding(
                  finding.infoType.name,
                  meta?.filename || 'unknown-file',
                  'CRITICAL',
                );
              }
            }

            // ZERO-TRUST RAG STEP 2: Redact all PII, API Keys, and Secrets BEFORE embedding
            const sanitizedText = await GoogleDlpService.redactText(text);

            // 1. Store text in AlloyDB
            const docId = await vectorStoreService.add(
              sanitizedText,
              { source: 'rag_service', chunkIndex: i + idx, ...meta },
              tenantId || meta?.tenantId || 'default_enterprise_tenant',
            );

            // 2. Generate embedding and push to Vertex AI Vector Search (Matching Engine)
            const embedding = await vertexService.getEmbeddings(sanitizedText);
            await vertexVectorSearch.upsertEmbeddings([
              { id: docId, embedding },
            ]);

            indexed++;
          } catch (err) {
            logger.warn(
              `RAG: Failed to index chunk ${i + idx} — skipping. Reason: ${err.message}`,
            );
            skipped++;
          }
        }),
      );
    }

    logger.info(
      `✅ RAG: Indexing complete. ${indexed} indexed, ${skipped} skipped.`,
    );

    // 🧠 AgentMemory Bridge: Record the RAG indexing event
    AgentMemoryHooks.captureToolUse(
      'rag_service',
      `Indexed ${indexed} documents into Enterprise Memory`,
      `${indexed} indexed, ${skipped} skipped. Source: ${meta?.filename || 'batch'}`,
      { indexed, skipped, bridge: 'rag_to_agentmemory' },
    ).catch(() => {});
  }

  /**
   * Ingest a raw file into the vector store.
   * Passes the raw bytes through Google's Magika Deep Learning model
   * to mathematically determine the file type before indexing.
   * @param {string} filePath
   * @param {object} [meta]
   * @param {string} [tenantId]
   */
  async ingestFile(filePath, meta = {}, tenantId) {
    try {
      const buffer = await fs.promises.readFile(filePath);

      // 💾 Immutable RAG Archival via Google Cloud Storage
      const fileName = path.basename(filePath);
      const archiveFileName = `ingested_${Date.now()}_${fileName}`;
      const archiveUrl = await GcsService.uploadFile(
        'alti-rag-archive',
        archiveFileName,
        buffer,
      );
      logger.info(
        `💾 [RAG] Immutable file archive created at Google Cloud Storage: ${archiveUrl}`,
      );

      const typeInfo = await magikaService.identifyFileType(buffer);

      logger.info(
        `📚 RAG: Magika verified file as [${typeInfo.label}] with ${(typeInfo.score * 100).toFixed(1)}% confidence.`,
      );

      let textContent = '';

      // 👁️ Multi-Modal Google AI Ingestion Routing
      if (typeInfo.label === 'pdf') {
        logger.info(
          `📚 RAG: Routing PDF to Google Cloud Document AI for geometric parsing...`,
        );
        textContent = await documentAiService.extractArchitectureDiagram(
          buffer,
          'application/pdf',
        );
      } else if (['png', 'jpeg', 'jpg', 'webp'].includes(typeInfo.label)) {
        logger.info(
          `📚 RAG: Routing Image to Google Cloud Vision API for OCR...`,
        );
        textContent = await visionService.detectText(buffer);
      } else {
        textContent = buffer.toString('utf-8');
      }

      if (!textContent || textContent.trim().length === 0) {
        logger.warn(
          `⚠️ RAG: No text could be extracted from ${filePath}. Skipping.`,
        );
        return;
      }

      // very basic chunking logic for demo purposes
      const chunks = textContent
        .split('\n\n')
        .filter(c => c.trim().length > 10);

      const enhancedMeta = {
        ...meta,
        magikaLabel: typeInfo.label,
        magikaScore: typeInfo.score,
        filePath,
        archiveUrl,
      };
      await this.createIndex(chunks, enhancedMeta, tenantId || meta?.tenantId);
    } catch (error) {
      logger.error(
        `❌ RAG: Failed to ingest file ${filePath}: ${error.message}`,
      );
    }
  }

  /**
   * Query the index and synthesize an answer using Gemini AI.
   * Gracefully handles vector store failures and always returns a string.
   *
   * @param {string} query
   * @param {number} [topK=5] - Number of chunks to retrieve
   * @param {string} [tenantId]
   * @returns {Promise<string>}
   */
  async query(query, topK = 5, tenantId) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return 'Query must be a non-empty string.';
    }

    let docs = [];
    let fileSearchContext = '';

    // Run Vertex Vector Search and Gemini File Search in parallel
    const vectorPromise = (async () => {
      try {
        const queryEmbedding = await vertexService.getEmbeddings(query);
        const neighbors = await vertexVectorSearch.queryContext(
          queryEmbedding,
          topK,
        );
        if (neighbors.length > 0) {
          const ids = neighbors.map(n => n.id);
          return await vectorStoreService.getByIds(
            ids,
            tenantId || 'default_enterprise_tenant',
          );
        }
      } catch (storeError) {
        logger.error(
          `RAG: Vertex Vector Search failed for query "${query}". Error: ${storeError.message}`,
        );
      }
      return [];
    })();

    const fileSearchPromise = (async () => {
      try {
        const { fileSearchService } =
          await import('../fileSearch/fileSearch.service.js');
        const stores = await fileSearchService.listStores();
        if (!stores || stores.length === 0) return '';

        const storeNames = stores.slice(0, 5).map(s => s.name);
        const fsPromise = fileSearchService.query(query, storeNames);
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 8000),
        );
        const result = await Promise.race([fsPromise, timeout]);

        if (result && result.text) {
          let ctx = `\n\n[GEMINI FILE SEARCH]\n${result.text}`;
          if (result.citations && result.citations.length > 0) {
            ctx += `\n\nDocument Citations:\n`;
            for (const c of result.citations) {
              ctx += `• ${c.title || 'Unknown'}${c.pageNumber ? ' (p.' + c.pageNumber + ')' : ''}: ${c.text || ''}\n`;
            }
          }
          return ctx;
        }
      } catch (e) {
        logger.debug(
          `[FileSearch] RAG parallel retrieval skipped: ${e.message}`,
        );
      }
      return '';
    })();

    [docs, fileSearchContext] = await Promise.all([
      vectorPromise,
      fileSearchPromise,
    ]);

    if (docs.length === 0 && !fileSearchContext) {
      return 'No relevant context found in Enterprise Memory to answer the query.';
    }

    const contextStr = docs.join('\n\n');
    const prompt = `You are the Omni-Mind querying the Global Enterprise Memory bank.
Answer the user's query strictly using the semantic context provided below.
If the context does not contain enough information, say so honestly.
When referencing document sources from Gemini File Search, include the document title and page number.

Context:
${contextStr}
${fileSearchContext}

Query: ${query}`;

    try {
      const response = await vertexService.generateContent(prompt);
      return response;
    } catch (aiError) {
      logger.error(`RAG: AI synthesis failed. Error: ${aiError.message}`);
      // Return raw context as a useful fallback instead of an opaque error
      return `Found relevant context but AI synthesis failed:\n\n${contextStr}${fileSearchContext}`;
    }
  }

  /**
   * Delete all entries from the vector index.
   * Useful for full re-indexing or test teardown.
   */
  async clearIndex() {
    try {
      await vectorStoreService.reset?.();
      logger.info('🗑️ RAG: Index cleared.');
    } catch (err) {
      logger.warn(`RAG: clearIndex() failed: ${err.message}`);
    }
  }
}

export const ragService = new RagService();
