/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { Document, VectorStoreIndex, Settings } from "llamaindex";
import { GeminiAiService } from '../gemini/gemini.service.js'; // We might need to adapt Gemini for LlamaIndex
import { logger } from '../../../shared/logger.js';

// Note: LlamaIndex usually requires an LLM and Embedding class. 
// We might need to use OpenAI or implement a custom Gemini LLM wrapper for LlamaIndex 
// if 'llamaindex' doesn't support generic Gemini calls out of the box nicely yet.
// For now, let's assume we use it for indexing simple Documents.

class RagService {
    constructor() {
        this.index = null;
    }

    /**
     * Create an index from a list of text content
     * @param {string[]} texts 
     */
    async createIndex(texts) {
        logger.info('📚 RAG: Creating LlamaIndex...');

        const documents = texts.map(t => new Document({ text: t }));

        // This might require OPENAI_API_KEY by default unless configured
        this.index = await VectorStoreIndex.fromDocuments(documents);

        logger.info('✅ RAG: Index created.');
    }

    /**
     * Query the index
     * @param {string} query 
     */
    async query(query) {
        if (!this.index) {
            return "Index not initialized.";
        }

        const queryEngine = this.index.asQueryEngine();
        const response = await queryEngine.query({ query });

        return response.toString();
    }
}

export const ragService = new RagService();
