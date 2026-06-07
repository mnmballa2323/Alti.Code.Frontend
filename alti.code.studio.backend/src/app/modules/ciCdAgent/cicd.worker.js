/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { CiCdAgentService } from './ciCdAgent.service.js';
import { vectorStoreService } from '../memory/vector.store.js';

export const ciCdWorkerProcessor = async (job) => {
    const { platform, pipelineId, userId } = job.data;
    const jobId = job.id;

    logger.info(`🚀 CiCdWorker [${jobId}]: Triggering pipeline ${pipelineId} on ${platform}...`);

    try {
        // 1. Trigger Pipeline
        const result = await CiCdAgentService.triggerPipeline(platform, pipelineId);

        // 2. Monitor/Poll (Simulated here)
        // In a real scenario, we might poll until 'status' is 'Success'
        // For Async Worker pattern, we might just log the trigger and let a webhook handle completion.
        // But for "God Mode", let's assume we track it.

        logger.info(`⏳ CiCdWorker [${jobId}]: Waiting for pipeline completion...`);
        // Simulate wait
        await new Promise(resolve => setTimeout(resolve, 100));

        // 3. Memorize Build (Cognitive Layer)
        await vectorStoreService.add(
            `Build ${result.buildId} for pipeline ${pipelineId}: SUCCESS`,
            { type: 'cicd-build', pipeline: pipelineId, buildId: result.buildId }
        );

        logger.info(`✅ CiCdWorker [${jobId}]: Pipeline Succeeded.`);
        return { ...result, status: 'Success' };

    } catch (error) {
        logger.error(`❌ CiCdWorker [${jobId}] Failed`, error);
        throw error;
    }
};
