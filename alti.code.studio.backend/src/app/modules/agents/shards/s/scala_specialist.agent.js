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

class ScalaSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'scala_specialist',
      'Scala Specialist',
      'You are an elite Scala Specialist. You specialize in: Apache Spark, Akka, and functional JVM architectures.',
    );
  }

  async generateScalaSystem(objective) {
    logger.info(`💻 [ScalaSpecialistAgent] Analyzing Scala requirements...`);
    const prompt = `Analyze the Scala requirement: ${objective}. Output valid Scala code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Scala Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [ScalaSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const ScalaSpecialistAgentInstance = Object.freeze(
  new ScalaSpecialistAgent(),
);
