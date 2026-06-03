import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { HiveOrchestratorService } from '../swarm/hiveOrchestrator.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * UX Analyst (Conversion Optimizer)
 * Analyzes frontend telemetry (drop-offs, bounce rates) and autonomously commands the Hive to A/B test a redesign.
 */
const optimizeConversion = async (userId, sessionId, analyticsData, currentFrontendCode) => {
    logger.info(`📊 [UX Analyst] Analyzing user drop-off telemetry...`);

    try {
        // Step 1: GPT-5.5 acts as the behavioral psychologist / UX expert
        const uxPrompt = `You are an elite UX Designer and Behavioral Psychologist.
Analyze the following frontend analytics telemetry. Users are failing to convert (drop-off, cart abandonment, high bounce rate).
Also review the current frontend React code that is causing this drop-off.

Identify the UX friction points and recommend an exact A/B test redesign (e.g., "Change the CTA to primary blue, move the pricing table above the fold, and simplify the form").

Telemetry:
${JSON.stringify(analyticsData, null, 2)}

Current Code:
${currentFrontendCode}

Return ONLY the raw A/B test redesign instructions, no markdown.`;

        const uxResult = await LlmGatewayService.routeCompletion(
            userId, sessionId, uxPrompt, 'gpt-5.5', 'UX-Analyst'
        );

        const redesignInstructions = uxResult.reply.trim();
        logger.info(`💡 [UX Analyst] Redesign hypothesis formulated: ${redesignInstructions.substring(0, 100)}...`);

        // Step 2: Spin up the Hive Swarm to autonomously implement the redesign
        logger.warn(`🐝 [UX Analyst] Commanding Alti Hive to build A/B Test Variant...`);
        const hiveCommand = `Implement the following UI/UX A/B test variant flawlessly against the existing frontend component:
${redesignInstructions}

Return the raw, refactored React code ready for deployment.`;

        const variantCode = await HiveOrchestratorService.executeSwarm(userId, sessionId, hiveCommand);

        logger.info(`✅ [UX Analyst] A/B Test variant built and ready for autonomous deployment.`);

        return {
            status: 'variant_ready',
            hypothesis: redesignInstructions,
            newFrontendCode: variantCode
        };

    } catch (error) {
        logger.error(`❌ [UX Analyst] UX optimization critically failed:`, error);
        throw error;
    }
};

export const UxAnalystService = {
    optimizeConversion
};
