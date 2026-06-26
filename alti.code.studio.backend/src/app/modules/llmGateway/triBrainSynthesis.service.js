import { LlmGatewayService } from './llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * TriBrainSynthesis Service
 * Distributes a complex reasoning or review task across three sovereign Azure deployments (Commercial, IL5, and IL6) simultaneously.
 * Synthesizes the consensus into a single superhuman output.
 */
const synthesize = async (userId, sessionId, contextPrompt, taskPrompt) => {
  logger.info(
    '🧠 [Tri-Brain] Initiating Sovereign Azure Tri-Deployment Synthesis (Commercial + IL5 + IL6)',
  );

  try {
    // Run all three deployments in parallel
    const [commResult, il5Result, il6Result] = await Promise.allSettled([
      LlmGatewayService.routeCompletion(
        userId,
        sessionId,
        `${contextPrompt}\n\nTask: ${taskPrompt}\n\nFocus strictly on ARCHITECTURE and SYSTEM DESIGN.`,
        'azure/gpt-5.5',
        'Synthesis',
      ),
      LlmGatewayService.routeCompletion(
        userId,
        sessionId,
        `${contextPrompt}\n\nTask: ${taskPrompt}\n\nFocus strictly on PERFORMANCE and CODE QUALITY.`,
        'azure/il5-gpt-5.5',
        'Synthesis',
      ),
      LlmGatewayService.routeCompletion(
        userId,
        sessionId,
        `${contextPrompt}\n\nTask: ${taskPrompt}\n\nFocus strictly on SECURITY VULNERABILITIES and EDGE CASES.`,
        'azure/il6-gpt-5.5',
        'Synthesis',
      ),
    ]);

    const commReply =
      commResult.status === 'fulfilled'
        ? commResult.value.reply
        : 'Azure Commercial Deployment Failed.';
    const il5Reply =
      il5Result.status === 'fulfilled'
        ? il5Result.value.reply
        : 'Azure US Gov IL5 Deployment Failed.';
    const il6Reply =
      il6Result.status === 'fulfilled'
        ? il6Result.value.reply
        : 'Azure US Gov IL6 Deployment Failed.';

    logger.info(
      '🧠 [Tri-Brain] Individual Azure deployment processing complete. Synthesizing consensus...',
    );

    // Final Synthesis by the leading model (Azure Commercial GPT-5.5)
    const synthesisPrompt = `You are the master Tri-Brain Synthesis core. You have delegated a task to three expert sovereign subsystems.
        
Azure Commercial (Architecture Expert) Output:
${commReply}

Azure US Gov IL5 (Performance Expert) Output:
${il5Reply}

Azure US Gov IL6 (Security Expert) Output:
${il6Reply}

Original Task: ${taskPrompt}

Your goal is to read all three expert opinions and synthesize them into a single, cohesive, flawless final output. Resolve any conflicts logically. Provide the ultimate master response.`;

    const finalResult = await LlmGatewayService.routeCompletion(
      userId,
      sessionId,
      synthesisPrompt,
      'azure/gpt-5.5',
      'Synthesis',
    );

    logger.info('✅ [Tri-Brain] Sovereign Azure Synthesis complete.');
    return finalResult.reply;
  } catch (error) {
    logger.error('❌ [Tri-Brain] Synthesis critically failed:', error);
    throw error;
  }
};

export const TriBrainSynthesisService = {
  synthesize,
};
