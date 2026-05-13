/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import { graphOrchestrator } from './graph.orchestrator.js';

class OrchestratorAgent {
    async execute(goal, userId, sessionId = `mission-${Date.now()}`) {
        const traceId = crypto.randomUUID();
        logger.info(`🐝 Orchestrator: Receiving goal: "${goal}" [TraceID: ${traceId}]`);

        try {
            // Delegate to the GraphOrchestrator
            const results = await graphOrchestrator.run(goal);

            return {
                status: 'success',
                completed_steps: results,
                traceId,
                sessionId
            };
        } catch (error) {
            logger.error(`❌ Orchestrator Failed [TraceID: ${traceId}]`, error);
            throw error;
        }
    }
}

export const Orchestrator = new OrchestratorAgent();
