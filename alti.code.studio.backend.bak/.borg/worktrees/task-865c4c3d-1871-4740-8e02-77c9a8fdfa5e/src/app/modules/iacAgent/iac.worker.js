/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { IacAgentService } from './iacAgent.service.js';
import { vectorStoreService } from '../memory/vector.store.js';

export const iacWorkerProcessor = async (job) => {
    const { tool, stackName, userId } = job.data;
    const jobId = job.id;

    logger.info(`🏗️ IacWorker [${jobId}]: Provisioning infrastructure with ${tool}...`);

    try {
        // 1. Apply Infrastructure
        const result = await IacAgentService.applyInfrastructure(tool, stackName);

        // 2. Memorize State (Cognitive Layer)
        await vectorStoreService.add(
            `Infrastructure Applied: ${stackName} using ${tool}. Resources: ${result.resources_changed}`,
            { type: 'iac-state', stack: stackName, timestamp: new Date().toISOString() }
        );

        logger.info(`✅ IacWorker [${jobId}]: Infrastructure Provisioned.`);
        return result;

    } catch (error) {
        logger.error(`❌ IacWorker [${jobId}] Failed`, error);
        throw error;
    }
};
