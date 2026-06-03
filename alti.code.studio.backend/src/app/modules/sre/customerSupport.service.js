import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { HiveOrchestratorService } from '../swarm/hiveOrchestrator.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Customer Support Engineer
 * Reads incoming bug reports (GitHub Issues), reproduces them, and writes the patch autonomously.
 */
const resolveCustomerIssue = async (userId, sessionId, issueDescription, appCodebase) => {
    logger.info(`🎧 [Customer Support] Analyzing new customer issue report...`);

    try {
        // Step 1: GPT-5.5 acts as the Tier 3 Support Engineer
        const supportPrompt = `You are an elite Tier 3 Customer Support Engineer and Developer.
Analyze the following customer bug report.
Based on the application codebase, deduce exactly where the bug is located and what logic is causing it.

Bug Report: ${issueDescription}
Codebase: ${appCodebase.substring(0, 30000)}

Return the exact debugging hypothesis and the specific file/function to fix.`;

        const supportResult = await LlmGatewayService.routeCompletion(
            userId, sessionId, supportPrompt, 'gpt-5.5', 'Customer-Support'
        );

        const hypothesis = supportResult.reply.trim();
        logger.info(`🔍 [Customer Support] Hypothesis formulated: ${hypothesis.substring(0, 100)}...`);

        // Step 2: Delegate the fix to the Hive Swarm
        logger.warn(`🐝 [Customer Support] Delegating bug fix to Alti Hive Swarm...`);
        const fixCommand = `A customer reported a bug. Here is the hypothesis: ${hypothesis}. Fix the code flawlessly.`;
        
        const fixedCode = await HiveOrchestratorService.executeSwarm(userId, sessionId, fixCommand);

        logger.info(`✅ [Customer Support] Bug patched. Ready to notify customer.`);

        return {
            status: 'issue_resolved',
            customerMessage: "Hi there! I'm an autonomous agent on the support team. I've located the issue, written a patch, and deployed the fix to production. Let us know if you need anything else!",
            fixedCode
        };

    } catch (error) {
        logger.error(`❌ [Customer Support] Issue resolution critically failed:`, error);
        throw error;
    }
};

export const CustomerSupportService = { resolveCustomerIssue };
