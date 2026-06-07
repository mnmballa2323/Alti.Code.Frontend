/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { DevOpsAgentService } from './devOpsAgent.service.js';
import { vectorStoreService } from '../memory/vector.store.js';

export const devOpsWorkerProcessor = async (job) => {
    const { provider, config, userId } = job.data;
    const jobId = job.id;

    logger.info(`🚀 DevOpsWorker [${jobId}]: Initiating deployment to ${provider}...`);

    try {
        // 1. Deploy
        const deploymentResult = await DevOpsAgentService.deployToCloud(provider, config);

        // 2. Log History to VectorStore (Cognitive Layer)
        // This allows agents to ask "When was the last deployment to AWS?"
        await vectorStoreService.add(
            `Deployment to ${provider} (${deploymentResult.deploymentId}) - Status: ${deploymentResult.status}`,
            { type: 'deployment-log', provider, timestamp: new Date().toISOString() }
        );

        logger.info(`✅ DevOpsWorker [${jobId}]: Deployment Successful.`);
        return deploymentResult;

    } catch (error) {
        logger.error(`❌ DevOpsWorker [${jobId}] Failed`, error);
        throw error;
    }
};
