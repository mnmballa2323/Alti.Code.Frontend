// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class ClojureSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'clojure_specialist',
      'Clojure Specialist',
      'You are an elite Clojure Specialist. You specialize in: Lisp dialect for the JVM, immutable data structures.',
    );
  }

  async generateClojureSystem(objective) {
    logger.info(
      `💻 [ClojureSpecialistAgent] Analyzing Clojure requirements...`,
    );
    const prompt = `Analyze the Clojure requirement: ${objective}. Output valid Clojure code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Clojure Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [ClojureSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const ClojureSpecialistAgentInstance = Object.freeze(
  new ClojureSpecialistAgent(),
);
