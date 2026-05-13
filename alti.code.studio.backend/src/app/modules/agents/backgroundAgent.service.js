/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * backgroundAgent.service.js — Open-Inspect (background-agents) integration service.
 * Dispatches sandbox tasks to the Cloudflare/Modal control plane.
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

class BackgroundAgentService {
    constructor() {
        this.controlPlaneUrl = process.env.OPEN_INSPECT_CONTROL_PLANE_URL || 'https://api.open-inspect.mock';
        this.apiToken = process.env.CLOUDFLARE_API_TOKEN || 'mock-token';
    }

    /**
     * @param {string} prompt The AI instruction
     * @param {string} contextBlock Full context block including files
     * @param {object} options Options including user config
     */
    async dispatchSession(prompt, contextBlock, options = {}) {
        logger.info(`🌐 [BackgroundAgentService] Dispatching session to Open-Inspect...`);
        logger.debug(`Prompt length: ${prompt.length}, Context length: ${contextBlock ? contextBlock.length : 0}`);

        // Generate a synthetic session ID for tracking
        const sessionId = crypto.randomUUID();
        const sessionUrl = `${this.controlPlaneUrl}/sessions/${sessionId}`;

        try {
            // Mocking the network call for Phase 2, wait 1s to simulate network latency to Cloudflare Durable Objects
            await new Promise(resolve => setTimeout(resolve, 1000));
            logger.info(`🌐 [BackgroundAgentService] Session ${sessionId} successfully created on Control Plane.`);

            return {
                id: sessionId,
                url: sessionUrl,
                status: 'dispatched',
                message: `Task successfully dispatched to background agent session ${sessionId}`
            };
        } catch (error) {
            logger.error(`❌ [BackgroundAgentService] Failed to create session: ${error.message}`);
            throw error;
        }
    }
}

export const backgroundAgentService = new BackgroundAgentService();
