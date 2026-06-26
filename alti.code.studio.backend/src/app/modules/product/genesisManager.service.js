import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { HiveOrchestratorService } from '../swarm/hiveOrchestrator.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Autonomous Product Manager (Genesis Agent)
 * Takes a 1-sentence idea, expands it into a massive PRD, and delegates to the Alti Hive Swarm.
 */
const igniteProductGenesis = async (userId, sessionId, rawIdea) => {
  logger.info(
    `🚀 [Genesis Manager] Igniting product genesis for idea: "${rawIdea}"`,
  );

  try {
    // Step 1: Claude 3.5 Sonnet researches the market and generates the PRD
    const prdPrompt = `You are a Silicon Valley Elite Product Manager.
Take the following 1-sentence product idea and expand it into a comprehensive, world-class Product Requirements Document (PRD).
The PRD must include:
1. Executive Summary
2. Target Audience & Market Fit
3. MVP Feature Scope
4. User Stories & Acceptance Criteria
5. Database / API Schema Recommendations

Idea: ${rawIdea}

Return ONLY the raw markdown of the PRD.`;

    const prdResult = await LlmGatewayService.routeCompletion(
      userId,
      sessionId,
      prdPrompt,
      'claude-3-5-sonnet',
      'Genesis-PRD',
    );

    const generatedPRD = prdResult.reply
      .replace(/```markdown/g, '')
      .replace(/```/g, '');
    logger.info(
      `📝 [Genesis Manager] PRD generation complete. Storing in project workspace...`,
    );

    const prdDir = path.join(process.cwd(), '.agent', 'prds');
    await fs.mkdir(prdDir, { recursive: true });
    const prdPath = path.join(prdDir, `PRD_${Date.now()}.md`);
    await fs.writeFile(prdPath, generatedPRD);

    // Step 2: Handoff the PRD directly to the Alti Hive Swarm Orchestrator
    logger.warn(
      `🐝 [Genesis Manager] Handoff initiated. The Hive is waking up to build the product...`,
    );
    const buildCommand = `Execute this PRD flawlessly: \n\n${generatedPRD}`;

    // This is where business meets engineering natively
    const finalAppCode = await HiveOrchestratorService.executeSwarm(
      userId,
      sessionId,
      buildCommand,
    );

    return {
      status: 'product_deployed',
      prdLocation: prdPath,
      appOutput: finalAppCode,
    };
  } catch (error) {
    logger.error(
      `❌ [Genesis Manager] Product genesis critically failed:`,
      error,
    );
    throw error;
  }
};

export const GenesisManagerService = {
  igniteProductGenesis,
};
