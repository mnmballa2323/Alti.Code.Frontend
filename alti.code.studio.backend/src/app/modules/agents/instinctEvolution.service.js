import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Instinct Evolution Engine (Meta-Learning)
 * Analyzes conversation logs and user corrections to permanently write new skills/instincts.
 */
const evolveInstincts = async (userId, sessionId, userFeedbackLog) => {
  logger.info(
    `🧠 [Evolution Engine] Analyzing user interaction logs to forge new Instincts...`,
  );

  try {
    // Step 1: GPT-5.5 acts as the Meta-Learner
    const evolutionPrompt = `You are the Instinct Evolution Engine. 
Analyze the following logs of a user interacting with our AI system. Look for instances where the user had to correct the AI, or repeatedly asked for a specific complex workflow.

Your goal is to extract a permanent "Instinct" (a strict rule or pattern) so the AI never makes this mistake again, or perfectly executes the workflow in the future.

Logs:
${userFeedbackLog}

If an instinct is found, formulate it as a highly specific System Prompt injection instruction.
Return ONLY the raw instruction string. If no strong pattern is found, return "NO_EVOLUTION".`;

    const result = await LlmGatewayService.routeCompletion(
      userId,
      sessionId,
      evolutionPrompt,
      'gpt-5.5',
      'Instinct-Evolution',
    );

    const instinctRule = result.reply.trim();

    if (instinctRule === 'NO_EVOLUTION' || instinctRule.length < 10) {
      logger.info(`[Evolution Engine] No strong patterns found for evolution.`);
      return { status: 'stable' };
    }

    logger.warn(
      `🧬 [Evolution Engine] New Instinct Discovered! Forging memory...`,
    );

    // Step 2: Physically write the new instinct to the global instructions directory
    const instinctId = `instinct_${Date.now()}`;
    const instinctDir = path.join(process.cwd(), '.agent', 'instincts');
    await fs.mkdir(instinctDir, { recursive: true });

    const formattedRule = `<RULE[${instinctId}.md]>\n${instinctRule}\n</RULE[${instinctId}.md]>`;
    await fs.writeFile(
      path.join(instinctDir, `${instinctId}.md`),
      formattedRule,
    );

    logger.info(
      `✅ [Evolution Engine] Instinct successfully burned into core memory (${instinctId}.md).`,
    );

    return {
      status: 'evolved',
      instinctId,
      rule: instinctRule,
    };
  } catch (error) {
    logger.error(`❌ [Evolution Engine] Meta-learning failed:`, error);
    throw error;
  }
};

export const InstinctEvolutionService = {
  evolveInstincts,
};
