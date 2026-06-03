import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Chaos Monkey Engineer
 * Randomly kills pods, throttles bandwidth, and severs connections to test system resilience.
 */
const orchestrateChaos = async (userId, sessionId, infrastructureState) => {
    logger.warn(`🐒 [Chaos Monkey] Initializing chaos injection protocols...`);

    try {
        const chaosPrompt = `You are a Chaos Engineering Architect.
Analyze the following infrastructure state (Kubernetes pods, DB connections, API gateways).
Design a highly targeted Chaos Injection scenario (e.g., "Kill primary DB node", "Add 500ms latency to API gateway").
Your goal is to test if the system's auto-failover and self-healing mechanisms work correctly.

Infrastructure State: ${JSON.stringify(infrastructureState).substring(0, 5000)}

Return ONLY the raw bash or kubectl commands required to inject this chaos.`;

        const result = await LlmGatewayService.routeCompletion(
            userId, sessionId, chaosPrompt, 'claude-3-5-sonnet', 'Chaos-Monkey'
        );

        const chaosScript = result.reply.replace(/```bash/g, '').replace(/```/g, '');
        logger.info(`✅ [Chaos Monkey] Chaos script generated.`);
        
        // In production, this executes the script via a sandbox or secured Kubernetes API call.
        logger.warn(`🔥 [Chaos Monkey] Ready to execute chaos script on target environment.`);

        return { status: 'chaos_ready', chaosScript };

    } catch (error) {
        logger.error(`❌ [Chaos Monkey] Chaos injection critically failed:`, error);
        throw error;
    }
};

export const ChaosMonkeyService = { orchestrateChaos };
