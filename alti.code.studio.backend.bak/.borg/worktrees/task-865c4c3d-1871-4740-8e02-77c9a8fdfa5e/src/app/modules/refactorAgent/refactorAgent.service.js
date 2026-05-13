/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { queueService } from '../queue/queue.service.js';

const refactorCode = async (codeSnippet, instruction, userId = 'system', sessionId = 'refactor-session') => {
    logger.info(`🚀 RefactorAgent: Queueing job for instruction: ${instruction}`);

    try {
        const job = await queueService.addJob('refactor-queue', {
            codeSnippet,
            instruction,
            userId,
            sessionId
        });

        if (!job) {
            throw new Error('Failed to enqueue refactor job');
        }

        logger.info(`✅ RefactorAgent: Job Queued [${job.id}]`);

        return {
            jobId: job.id,
            status: 'queued',
            message: 'Refactoring is processing in the background. Check status via /api/v1/queue/status/:jobId (Not implemented yet but you get the idea)'
        };

    } catch (error) {
        logger.error('RefactorAgent: Failed to queue job', error);
        throw error;
    }
};

export const RefactorAgentService = {
    refactorCode,
};
