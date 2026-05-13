/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';
import crypto from 'crypto';

// Harness / Gitness Integration Service
// Focus: Orchestrating pipelines via Harness Open Source (Gitness) or SaaS API

const executePipeline = async (pipelineIdentifier, inputs = {}) => {
    if (!pipelineIdentifier || typeof pipelineIdentifier !== 'string') {
        throw new Error('HarnessService: pipelineIdentifier must be a non-empty string.');
    }
    logger.info(`🚀 Harness: Executing pipeline: ${pipelineIdentifier}`, inputs);

    // In a real implementation, this would make an HTTP POST to the Harness/Gitness API endpoint
    // url: \`\${config.harness_url}/api/v1/repos/\${repo}/pipelines/\${pipelineIdentifier}/executions\`

    // Mocking the successful execution for MVP demonstration
    const executionId = `exec-${crypto.randomUUID().slice(0, 8)}`;

    return {
        status: 'Running',
        pipelineIdentifier,
        executionId,
        dashboardUrl: `https://app.harness.io/ng/pipelines/execution/${executionId}`,
        inputs
    };
};

const getExecutionStatus = async (executionId) => {
    logger.info(`Checking Harness execution status: ${executionId}`);

    // Mock status
    const statuses = ['Running', 'Success', 'Failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
        executionId,
        status: randomStatus,
        duration: '2m 15s'
    };
};

export const HarnessService = {
    executePipeline,
    getExecutionStatus
};
