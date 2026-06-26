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

class PostScriptSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'postscript_specialist',
      'PostScript Specialist',
      'You are an elite PostScript Specialist. You specialize in: Page description languages and printer rendering engines.',
    );
  }

  async generatePostScriptSystem(objective) {
    logger.info(
      `💻 [PostScriptSpecialistAgent] Analyzing PostScript requirements...`,
    );
    const prompt = `Analyze the PostScript requirement: ${objective}. Output valid PostScript code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - PostScript Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [PostScriptSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const PostScriptSpecialistAgentInstance = Object.freeze(
  new PostScriptSpecialistAgent(),
);
