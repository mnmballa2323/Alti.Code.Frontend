/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { vertexService } from '../ai/vertex.service.js';
import { logger } from '../../../shared/logger.js';
import { vectorStoreService } from './vector.store.js';

/** Maximum number of documents to index concurrently. */
const BATCH_SIZE = 8;

class RagService {
    /**
     * Create an index from a list of text content.
     * Documents are processed in parallel batches for throughput.
     *
     * @param {string[]} texts
     * @param {object}   [meta]  - Extra metadata to attach to every chunk
     */
    async createIndex(texts, meta = {}) {
        if (!Array.isArray(texts) || texts.length === 0) {
            logger.warn('📚 RAG: createIndex() called with empty or invalid texts array.');
            return;
        }

        logger.info(`📚 RAG: Indexing ${texts.length} document(s) into Enterprise Memory...`);

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
                        await vectorStoreService.add(text, { source: 'rag_service', chunkIndex: i + idx, ...meta });
                        indexed++;
                    } catch (err) {
                        logger.warn(`RAG: Failed to index chunk ${i + idx} — skipping. Reason: ${err.message}`);
                        skipped++;
                    }
                })
            );
        }

        logger.info(`✅ RAG: Indexing complete. ${indexed} indexed, ${skipped} skipped.`);
    }

    /**
     * Query the index and synthesize an answer using Gemini AI.
     * Gracefully handles vector store failures and always returns a string.
     *
     * @param {string} query
     * @param {number} [topK=5] - Number of chunks to retrieve
     * @returns {Promise<string>}
     */
    async query(query, topK = 5) {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return 'Query must be a non-empty string.';
        }

        let results;
        try {
            results = await vectorStoreService.search(query, topK);
        } catch (storeError) {
            logger.error(`RAG: Vector store search failed for query "${query}". Error: ${storeError.message}`);
            return 'The knowledge base is temporarily unavailable. Please try again shortly.';
        }

        // Normalize results — different vector stores return different shapes:
        //   ChromaDB: { documents: [[...]] }
        //   Pinecone/Weaviate: { matches: [{ metadata: { text } }] }
        //   Custom fallback: plain string[]
        let docs = [];
        if (Array.isArray(results?.documents?.[0])) {
            docs = results.documents[0];
        } else if (Array.isArray(results?.matches)) {
            docs = results.matches.map(m => m?.metadata?.text ?? m?.text ?? '').filter(Boolean);
        } else if (Array.isArray(results)) {
            docs = results.map(r => (typeof r === 'string' ? r : r?.text ?? JSON.stringify(r)));
        }

        if (docs.length === 0) {
            return 'No relevant context found in Enterprise Memory to answer the query.';
        }

        const contextStr = docs.join('\n\n');
        const prompt = `You are the Omni-Mind querying the Global Enterprise Memory bank.
Answer the user's query strictly using the semantic context provided below.
If the context does not contain enough information, say so honestly.

Context:
${contextStr}

Query: ${query}`;

        try {
            const response = await vertexService.generateContent(prompt);
            return response;
        } catch (aiError) {
            logger.error(`RAG: AI synthesis failed. Error: ${aiError.message}`);
            // Return raw context as a useful fallback instead of an opaque error
            return `Found relevant context but AI synthesis failed:\n\n${contextStr}`;
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
