/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class GroovySpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'groovy_specialist',
      'Groovy Specialist',
      'You are an elite Groovy Specialist. You specialize in: Gradle build scripts, Jenkins pipelines, and JVM scripting.',
    );
  }

  async generateGroovySystem(objective) {
    logger.info(`💻 [GroovySpecialistAgent] Analyzing Groovy requirements...`);
    const prompt = `Analyze the Groovy requirement: ${objective}. Output valid Groovy code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Groovy Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [GroovySpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const GroovySpecialistAgentInstance = new GroovySpecialistAgent();
