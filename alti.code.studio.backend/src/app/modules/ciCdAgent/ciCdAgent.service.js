/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

const triggerPipeline = async (platform, pipelineId) => {
    if (!platform || typeof platform !== 'string') {
        throw new Error('CiCdAgentService: platform must be a non-empty string.');
    }
    if (!pipelineId || typeof pipelineId !== 'string') {
        throw new Error('CiCdAgentService: pipelineId must be a non-empty string.');
    }
    logger.info(`🚀 CiCdAgent: Triggering CI/CD pipeline on ${platform} for ${pipelineId}`);

    // Use UUID slice for a short, non-guessable, collision-resistant build ID
    const buildId = `build-${crypto.randomUUID().slice(0, 8)}`;

    return {
        status: 'triggered',
        platform,
        pipelineId,
        buildId,
        url: `https://${platform.toLowerCase()}.com/pipelines/${pipelineId}/runs/${buildId}`
    };
};

export const CiCdAgentService = {
    triggerPipeline,
};
