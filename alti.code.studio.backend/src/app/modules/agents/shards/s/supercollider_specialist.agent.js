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

class SuperColliderSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'supercollider_specialist',
      'SuperCollider Specialist',
      'You are an elite SuperCollider Specialist. You specialize in: Algorithmic music composition and audio synthesis.',
    );
  }

  async generateSuperColliderSystem(objective) {
    logger.info(
      `💻 [SuperColliderSpecialistAgent] Analyzing SuperCollider requirements...`,
    );
    const prompt = `Analyze the SuperCollider requirement: ${objective}. Output valid SuperCollider code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - SuperCollider Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SuperColliderSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const SuperColliderSpecialistAgentInstance = Object.freeze(
  new SuperColliderSpecialistAgent(),
);
