/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { ChromaClient } from 'chromadb';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class VectorStoreService {
    constructor() {
        this.client = new ChromaClient();
        this.collection = null;
        this.init();
    }

    async init() {
        try {
            // Ensure collection exists
            this.collection = await this.client.getOrCreateCollection({
                name: "alti_memory",
                metadata: { description: "Long-term memory for Alti Agents" }
            });
            logger.info('🧠 VectorStore: ChromaDB initialized.');
        } catch (error) {
            logger.error('❌ VectorStore init failed. Is Chroma running?', error);
        }
    }

    /**
     * Add a document to memory
     * @param {string} text 
     * @param {object} metadata 
     */
    async add(text, metadata = {}) {
        if (!this.collection) await this.init();

        try {
            // Get embedding from Gemini
            const embedding = await GeminiAiService.getEmbeddings(text);
            const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await this.collection.add({
                ids: [id],
                embeddings: [embedding],
                metadatas: [metadata],
                documents: [text]
            });

            logger.info(`💾 Memory stored: ${id}`);
            return id;
        } catch (error) {
            logger.error('Failed to add to memory', error);
            throw error;
        }
    }

    /**
     * Search memory
     * @param {string} query 
     * @param {number} nResults 
     */
    async search(query, nResults = 3) {
        if (!this.collection) await this.init();

        try {
            const embedding = await GeminiAiService.getEmbeddings(query);

            const results = await this.collection.query({
                queryEmbeddings: [embedding],
                nResults: nResults
            });

            return results;
        } catch (error) {
            logger.error('Memory search failed', error);
            return [];
        }
    }
}

export const vectorStoreService = new VectorStoreService();
