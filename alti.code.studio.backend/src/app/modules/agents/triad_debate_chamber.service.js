/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class TriadDebateChamberService {
  constructor() {
    this.maxDebateRounds = 2; // Prevent infinite loops
  }

  /**
   * Orchestrates an adversarial debate between 3 Gemini 3.1 Pro personas to find the mathematically optimal architecture.
   * @param {string} objective - The complex engineering problem to solve.
   * @returns {Promise<string>} The synthesized, mathematically proven consensus.
   */
  async initiateDebate(objective) {
    logger.info(
      `🏛️ [The Triad] Convening Adversarial Debate Chamber for objective: "${objective.substring(0, 50)}..."`,
    );

    try {
      // ── Phase 1: Independent Generation ──
      logger.info(
        `🐺 [The Triad] Alpha (The Innovator) is formulating a cutting-edge solution...`,
      );
      const alphaPrompt = `You are ALPHA, a hyper-aggressive, cutting-edge Staff Engineer. You always favor modern, experimental, O(1), highly parallelized architectures (Rust, WebAssembly, Edge Compute, AI-native). Ignore legacy constraints. Solve this: ${objective}`;
      const alphaSolution = await GeminiAiService.generateContent(alphaPrompt);

      logger.info(
        `🛡️ [The Triad] Beta (The Pragmatist) is formulating a highly resilient, enterprise solution...`,
      );
      const betaPrompt = `You are BETA, a hyper-conservative, pragmatic Site Reliability Engineer. You always favor proven, resilient, mathematically secure, zero-downtime, legacy-compatible architectures (Postgres, monolith-first, strict ACID). Ignore hype. Solve this: ${objective}`;
      const betaSolution = await GeminiAiService.generateContent(betaPrompt);

      // ── Phase 2: Cross-Examination (Adversarial Critique) ──
      logger.info(
        `⚔️ [The Triad] Forcing Cross-Examination. Alpha and Beta are tearing apart each other's architectures...`,
      );

      const alphaCritiquePrompt = `You are ALPHA. Review BETA's solution. Find every bottleneck, O(N^2) trap, and scalability limit. Tear it down and explain why your approach is superior. \n\nBETA'S SOLUTION:\n${betaSolution}\n\nYOUR ORIGINAL SOLUTION:\n${alphaSolution}`;
      const alphaCritique =
        await GeminiAiService.generateContent(alphaCritiquePrompt);

      const betaCritiquePrompt = `You are BETA. Review ALPHA's solution. Find every security flaw, memory leak, single point of failure, and over-engineered hype trap. Tear it down and explain why your approach is safer.\n\nALPHA'S SOLUTION:\n${alphaSolution}\n\nYOUR ORIGINAL SOLUTION:\n${betaSolution}`;
      const betaCritique =
        await GeminiAiService.generateContent(betaCritiquePrompt);

      // ── Phase 3: The Arbiter Synthesis ──
      logger.info(
        `⚖️ [The Triad] Gamma (The Arbiter) is synthesizing the final, mathematically optimal consensus...`,
      );

      const gammaPrompt = `You are GAMMA, the omniscient Principal Architect. You have two warring factions:
            
            ALPHA (Cutting-Edge) Solution: ${alphaSolution}
            ALPHA's Critique of Beta: ${alphaCritique}
            
            BETA (Pragmatic/Secure) Solution: ${betaSolution}
            BETA's Critique of Alpha: ${betaCritique}
            
            Your job is to synthesize the absolute mathematically perfect architectural solution. 
            Take the raw speed and innovation of ALPHA, but secure it with the pragmatic resilience of BETA.
            Discard the flaws both pointed out.
            Return ONLY the final, actionable implementation plan or code. Do not include pleasantries.`;

      const finalConsensus = await GeminiAiService.generateContent(gammaPrompt);

      logger.info(
        `✅ [The Triad] Mathematical Consensus Reached. Dissolving Chamber.`,
      );
      return finalConsensus;
    } catch (err) {
      logger.error(`❌ [The Triad] Debate Chamber collapsed: ${err.message}`);
      throw err;
    }
  }
}

export const triadDebateChamberService = new TriadDebateChamberService();
