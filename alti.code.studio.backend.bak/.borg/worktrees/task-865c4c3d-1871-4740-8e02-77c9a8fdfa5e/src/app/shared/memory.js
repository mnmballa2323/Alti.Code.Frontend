/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { logger } from '../../shared/logger.js';
import { postgresClient } from './postgres.client.js';
import { GeminiAiService } from '../modules/gemini/gemini.service.js';

class AntigravityMemory {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        // 1. Initialize Postgres
        await postgresClient.init();
        logger.info('🧠 Memory initialized using Gemini AI');
        this.isInitialized = true;
    }

    async add(content, metadata = {}) {
        if (!this.isInitialized) await this.init();

        try {
            const embedding = await GeminiAiService.getEmbeddings(content);
            const id = await postgresClient.insertMemory(content, metadata, embedding);

            if (id) {
                // logger.info(`🧠 Memory saved (ID: ${id})`);
                return id;
            }
        } catch (error) {
            logger.error('Failed to add memory', error);
        }
        return null;
    }

    async search(query, limit = 5) {
        if (!this.isInitialized) await this.init();

        try {
            const embedding = await GeminiAiService.getEmbeddings(query);
            return await postgresClient.searchMemories(embedding, limit);
        } catch (error) {
            logger.error('Failed to search memory', error);
            return [];
        }
    }
}

export const VectorMemory = new AntigravityMemory();
