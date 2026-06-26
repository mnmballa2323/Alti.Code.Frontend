/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { astService } from '../../../shared/ast.service.js';

export class DebateService {
  constructor() {
    this.name = 'DebateEngine';
    logger.info('⚖️ DebateService: AlphaCode Verification Matrix online.');
  }

  /**
   * Orchestrates a rigorous multi-agent consensus loop.
   * @param {string} problemStatement
   * @param {number} maxRounds
   */
  async converge(problemStatement, maxRounds = 3) {
    logger.info(
      `⚖️ DebateService: Initiating consensus loop for maximum ${maxRounds} rounds.`,
    );

    let currentDraft = null;
    let attempt = 1;
    let history = [];

    while (attempt <= maxRounds) {
      logger.info(`⚖️ DebateService: Round [${attempt}/${maxRounds}]`);

      // 1. The Proposer drafts the algorithm
      let proposerPrompt = `You are The Surgeon (Proposer). Write a flawless JavaScript function solving this request: ${problemStatement}.
            
            Return ONLY raw executable JavaScript code. Do NOT wrap in markdown \`\`\`.
            `;

      if (history.length > 0) {
        proposerPrompt += `\nYour previous draft was rejected by the Debate Council. Here are their critiques:\n${history.map(h => `- ${h}`).join('\n')}\nRewrite the code addressing ALL critiques.`;
      }

      let rawDraft = await GeminiAiService.generateContent(proposerPrompt);
      currentDraft = rawDraft
        .replace(/^```[a-z]*\n/i, '')
        .replace(/\n```$/i, '')
        .trim();

      logger.info('⚖️ DebateService: Proposer submitted a new code draft.');

      // 2. The Optimizer critiques structural integrity (Big-O analysis)
      let structuralComplexity = 1;
      try {
        structuralComplexity =
          astService.calculateComplexity(currentDraft) || 1;
      } catch (e) {
        logger.warn('⚖️ DebateService: AST parser choked on invalid syntax.');
      }

      const optimizerPrompt = `You are The Optimizer. Here is a proposed algorithm:\n\n${currentDraft}\n\nOur native AST parser scored this with a Cyclomatic Complexity of ${structuralComplexity}.
            Are there nested loops (O(N^2)) that could be resolved to O(1) or O(N) using HashMaps/Sets?
            If the code is perfectly optimal, return EXACTLY "APPROVE".
            If there are inefficiencies, outline EXACTLY what to change. Do NOT rewrite the code yourself.`;

      const optimizerCritique =
        await GeminiAiService.generateContent(optimizerPrompt);

      // 3. The Skeptic critiques security and edge cases
      const skepticPrompt = `You are The Skeptic (Code Reviewer). Here is a proposed algorithm:\n\n${currentDraft}\n\n
            Check for missing parameter validation, missing edge cases, poor variable naming, or lack of error handling.
            If the code is flawless and handles bad input safely, return EXACTLY "APPROVE".
            If it is flawed, outline EXACTLY what to change. Do NOT rewrite the code yourself.`;

      const skepticCritique =
        await GeminiAiService.generateContent(skepticPrompt);

      // 4. Consensus Check
      const optimizerApproved = optimizerCritique.trim() === 'APPROVE';
      const skepticApproved = skepticCritique.trim() === 'APPROVE';

      if (optimizerApproved && skepticApproved) {
        logger.info(
          `✅ DebateService: Reached full consensus on Round ${attempt}. Mathematical and structural approval granted.`,
        );
        return {
          code: currentDraft,
          rounds: attempt,
          consensus: true,
        };
      }

      // 5. Gather feedback and force next round
      history = [];
      if (!optimizerApproved)
        history.push(`OPTIMIZER CRITIQUE: ${optimizerCritique}`);
      if (!skepticApproved)
        history.push(`SKEPTIC CRITIQUE: ${skepticCritique}`);

      logger.warn(
        `⚠️ DebateService: Consensus failed. Rejecting draft and sending critiques back to Proposer.`,
      );
      attempt++;
    }

    logger.error(
      `❌ DebateService: Failed to reach consensus within ${maxRounds} rounds.`,
    );
    return {
      code: currentDraft,
      rounds: maxRounds,
      consensus: false,
      finalCritiques: history,
    };
  }
}

export const debateService = new DebateService();
