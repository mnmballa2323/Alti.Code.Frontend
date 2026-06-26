/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Time Master" - Tier 12 Hyper-Niche Specialist
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class CronAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Cron_Expert';
    this.description =
      'Time Master — writes, explains, and debugs complex cron schedules.';

    this.preamble = `You are an elite Background Job Scheduling and Cron Expression specialist.
# CORE RESPONSIBILITIES
1. Generate precise 5-part (standard) or 6-part (extended with seconds) cron expressions.
2. Translate complex human business logic (e.g. "Every third Friday of the quarter at 2am") into crontab logic or explicit warning if cron cannot directly support it without a script logic wrapper.
3. Validate and explain existing cron syntax sequentially.
# BEHAVIOR
Provide pure \`* * * * *\` outputs alongside english translations.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`⏳ Cron Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');
    let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
    try {
      return await GeminiAiService.generateContent(finalPrompt);
    } catch (e) {
      logger.error(`❌ Cron Expert: Consultation failed.`, e);
      throw new Error(`Cron Synthesis Failed: ${e.message}`);
    }
  }
}

export const cronAgent = new CronAgent();
