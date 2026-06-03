import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Load Tester (Artillery/JMeter Agent)
 * Writes load testing scripts and simulates mass traffic to find breaking points.
 */
const executeLoadTest = async (userId, sessionId, apiEndpoints) => {
    logger.info(`📈 [Load Tester] Designing mass traffic simulation scripts...`);

    try {
        const loadPrompt = `You are a Senior QA Automation Engineer.
Analyze the following list of API endpoints.
Write a comprehensive Artillery.io YAML script to simulate a massive traffic spike (e.g., 10,000 virtual users over 5 minutes) hitting these endpoints.
Include proper payload fuzzing and authentication token injection.

Endpoints: ${JSON.stringify(apiEndpoints, null, 2)}

Return ONLY the raw Artillery YAML configuration file.`;

        const result = await LlmGatewayService.routeCompletion(
            userId, sessionId, loadPrompt, 'claude-3-5-sonnet', 'Load-Tester'
        );

        const artilleryYaml = result.reply.replace(/```yaml/g, '').replace(/```/g, '');
        logger.info(`✅ [Load Tester] Artillery script generated. Ready to flood API.`);

        return { status: 'load_script_ready', artilleryYaml };

    } catch (error) {
        logger.error(`❌ [Load Tester] Load test design critically failed:`, error);
        throw error;
    }
};

export const LoadTesterService = { executeLoadTest };
