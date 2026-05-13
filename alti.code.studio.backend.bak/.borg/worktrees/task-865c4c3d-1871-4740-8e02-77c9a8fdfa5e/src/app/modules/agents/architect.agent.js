/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { contextService } from '../cortex/context.service.js';
import { logger } from '../../../shared/logger.js';

class ArchitectAgent {

    /**
     * Explain a part of the system with architectural depth.
     * @param {string} topic - e.g. "Authentication", "Database Schema"
     */
    async explainSystem(topic) {
        logger.info(`🏛️ Architect: Analyzing ${topic}...`);

        // Enrich detailed query for ContextService
        const query = `Explain the architecture of ${topic} in this codebase. Include key files, classes, and flow.`;

        // We hijack the query logic but using the same ContextService
        // But we want to modify the prompt inside ContextService... 
        // For now, let's just use ContextService as is, but maybe ContextService should accept a custom instruction?
        // Let's rely on the query phrasing.

        const result = await contextService.query(query);

        // Post-process if needed (e.g. extract Mermaid)
        // For now, return result directly.
        return {
            ...result,
            agent: 'Architect'
        };
    }
}

export const architectAgent = new ArchitectAgent();
