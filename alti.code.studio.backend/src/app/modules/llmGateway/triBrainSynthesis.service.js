import { LlmGatewayService } from './llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * TriBrainSynthesis Service
 * Distributes a complex reasoning or review task across AWS, GCP, and Azure simultaneously.
 * Synthesizes the consensus into a single superhuman output.
 */
const synthesize = async (userId, sessionId, contextPrompt, taskPrompt) => {
    logger.info('🧠 [Tri-Brain] Initiating Multi-Model Synthesis (AWS + GCP + Azure)');

    try {
        // Run all three clouds in parallel
        const [awsResult, gcpResult, azureResult] = await Promise.allSettled([
            LlmGatewayService.routeCompletion(
                userId, 
                sessionId, 
                `${contextPrompt}\n\nTask: ${taskPrompt}\n\nFocus strictly on ARCHITECTURE and SYSTEM DESIGN.`, 
                'claude-3-5-sonnet', 
                'Synthesis'
            ),
            LlmGatewayService.routeCompletion(
                userId, 
                sessionId, 
                `${contextPrompt}\n\nTask: ${taskPrompt}\n\nFocus strictly on PERFORMANCE and CODE QUALITY.`, 
                'gemini-3.1-pro-002', 
                'Synthesis'
            ),
            LlmGatewayService.routeCompletion(
                userId, 
                sessionId, 
                `${contextPrompt}\n\nTask: ${taskPrompt}\n\nFocus strictly on SECURITY VULNERABILITIES and EDGE CASES.`, 
                'gpt-5.5', 
                'Synthesis'
            )
        ]);

        const awsReply = awsResult.status === 'fulfilled' ? awsResult.value.reply : 'AWS Bedrock Failed.';
        const gcpReply = gcpResult.status === 'fulfilled' ? gcpResult.value.reply : 'GCP Vertex AI Failed.';
        const azureReply = azureResult.status === 'fulfilled' ? azureResult.value.reply : 'Azure OpenAI Failed.';

        logger.info('🧠 [Tri-Brain] Individual cloud processing complete. Synthesizing consensus...');

        // Final Synthesis by the leading model (Claude 3.5 Sonnet is best at synthesis)
        const synthesisPrompt = `You are the master Tri-Brain Synthesis core. You have delegated a task to three expert subsystems.
        
AWS Bedrock (Architecture Expert) Output:
${awsReply}

GCP Vertex AI (Performance Expert) Output:
${gcpReply}

Azure OpenAI (Security Expert) Output:
${azureReply}

Original Task: ${taskPrompt}

Your goal is to read all three expert opinions and synthesize them into a single, cohesive, flawless final output. Resolve any conflicts logically. Provide the ultimate master response.`;

        const finalResult = await LlmGatewayService.routeCompletion(
            userId,
            sessionId,
            synthesisPrompt,
            'claude-3-5-sonnet',
            'Synthesis'
        );

        logger.info('✅ [Tri-Brain] Synthesis complete.');
        return finalResult.reply;

    } catch (error) {
        logger.error('❌ [Tri-Brain] Synthesis critically failed:', error);
        throw error;
    }
};

export const TriBrainSynthesisService = {
    synthesize
};
