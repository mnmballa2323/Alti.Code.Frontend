/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { Langfuse } from 'langfuse';
import { logger } from '../../../shared/logger.js';

class ObservabilityService {
    constructor() {
        this.langfuse = null;
        this.init();
    }

    init() {
        // Initialize Langfuse only if keys are present
        if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
            this.langfuse = new Langfuse({
                publicKey: process.env.LANGFUSE_PUBLIC_KEY,
                secretKey: process.env.LANGFUSE_SECRET_KEY,
                baseUrl: process.env.LANGFUSE_HOST || "https://cloud.langfuse.com"
            });
            logger.info('🔭 Observability: Langfuse initialized.');
        } else {
            logger.warn('🔭 Observability: Langfuse keys missing. Tracing disabled.');
        }
    }

    /**
     * Create a new trace for a mission or task
     * @param {string} name 
     * @param {string} userId 
     * @param {string} sessionId 
     */
    trace(name, userId, sessionId) {
        if (!this.langfuse) return null;

        return this.langfuse.trace({
            name,
            userId,
            sessionId,
            metadata: { env: process.env.NODE_ENV }
        });
    }

    /**
     * Create a generation span for an AI call
     * @param {object} trace 
     * @param {string} name 
     * @param {object} params - model, prompt, etc.
     */
    generation(trace, name, params) {
        if (!trace) return null;

        return trace.generation({
            name,
            model: params.model,
            modelParameters: params.config,
            input: params.prompt
        });
    }

    async flush() {
        if (this.langfuse) {
            await this.langfuse.flush();
        }
    }
}

export const observabilityService = new ObservabilityService();
