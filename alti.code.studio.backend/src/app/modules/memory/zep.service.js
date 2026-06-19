/**
 * Copyright (c) 2026 Inso Code
 *
 * zep.service.js — Zep Agent Memory Service
 * Manages long-term semantic summary memory profiles for agent sessions.
 */

import { ZepClient } from '@getzep/zep-js';
import { logger } from '../../../shared/logger.js';

export class ZepMemoryService {
    constructor() {
        this.apiUrl = process.env.ZEP_API_URL;
        this.apiKey = process.env.ZEP_API_KEY;
        this.client = null;
        
        if (this.apiUrl) {
            try {
                this.client = new ZepClient({
                    apiUrl: this.apiUrl,
                    apiKey: this.apiKey || undefined
                });
                logger.info(`🧠 [Zep Memory] Client initialized (Server: ${this.apiUrl}).`);
            } catch (error) {
                logger.error(`❌ [Zep Memory] Initialization failed: ${error.message}`);
            }
        } else {
            logger.info('🧠 [Zep Memory] ZEP_API_URL not set. Running in local Redis fallback mode.');
        }
    }

    isActive() {
        return !!this.client;
    }

    /**
     * Add a message payload to Zep memory session history.
     * @param {string} sessionId
     * @param {string} role - 'human' | 'ai'
     * @param {string} content
     */
    async addMemory(sessionId, role, content) {
        if (!this.isActive()) return;

        try {
            // Map standard chat roles to Zep expected role descriptors
            const zepRole = role === 'human' || role === 'user' ? 'human' : 'ai';
            
            await this.client.memory.addMemory(sessionId, {
                messages: [{
                    role: zepRole,
                    content: content
                }]
            });
            logger.info(`🧠 [Zep Memory] Successfully appended ${zepRole} message to session ${sessionId}.`);
        } catch (error) {
            logger.warn(`⚠️ [Zep Memory] Failed to store memory: ${error.message}`);
        }
    }

    /**
     * Fetch long-term memory summary context for a session.
     * @param {string} sessionId
     * @returns {Promise<{summary: string, relevantHistory: Array}>}
     */
    async getMemory(sessionId) {
        if (!this.isActive()) {
            return { summary: '', relevantHistory: [] };
        }

        try {
            const memory = await this.client.memory.getMemory(sessionId);
            if (memory) {
                return {
                    summary: memory.summary?.content || '',
                    relevantHistory: memory.messages || []
                };
            }
        } catch (error) {
            logger.warn(`⚠️ [Zep Memory] Failed to fetch session memory: ${error.message}`);
        }

        return { summary: '', relevantHistory: [] };
    }
}

export const zepMemoryService = new ZepMemoryService();
