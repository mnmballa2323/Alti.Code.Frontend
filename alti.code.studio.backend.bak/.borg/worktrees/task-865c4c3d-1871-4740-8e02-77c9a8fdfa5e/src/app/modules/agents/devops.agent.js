/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { contextService } from '../cortex/context.service.js';
import { dockerService } from '../../../shared/docker.service.js';
import { logger } from '../../../shared/logger.js';

class DevOpsAgent {

    async checkHealth() {
        logger.info('🏗️ DevOps: Checking infrastructure health...');
        const containers = await dockerService.listContainers();
        return {
            status: 'active',
            containers: containers.length,
            details: containers
        };
    }

    async generatePipeline(type) {
        logger.info(`🏗️ DevOps: Generating ${type} pipeline...`);
        // Use RAG to see existing config
        const result = await contextService.query(`Show me the existing ${type} configuration or package.json scripts.`);

        return {
            analysis: result.answer,
            suggestion: "Based on the above, here is a recommended pipeline..."
        };
    }
}

export const devOpsAgent = new DevOpsAgent();
