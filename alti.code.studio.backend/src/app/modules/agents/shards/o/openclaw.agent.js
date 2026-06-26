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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { openclawProxyService } from '../openclaw/openclaw.proxy.service.js';
import { logger } from '../../../../shared/logger.js';

class OpenClawAgent extends BaseSpecialistAgent {
  constructor() {
    super('OpenClawAgent', 'The Local Automator', 'Tier 12');
    this.name = 'OpenClawAgent';
  }

  async _invoke(context) {
    logger.info(
      `🤖 Local Automator: Planning delegation to physical host for context: "${context.goal}"`,
    );

    // 1. Synthesize the OpenClaw Intent
    const prompt = `You are the Local Automator Swarm Agent.
Your job is to translate the current Cloud Sprint Goal into a specific automation intent for "Moltbot" (OpenClaw), an autonomous agent running physically on the user's local machine.

Moltbot has full system access, shell access, browser access, and direct local MCP/local tools integrations.

Cloud Sprint Goal: "${context.goal}"
Current Code Context: ${JSON.stringify(context.files || {})}

Generate a precise natural language command for the local Moltbot Surrogate.
Optionally, it can do standard OS automation: "Open the Chrome browser, navigate to staging.insocode.com...".
Return ONLY the raw intent string, no markdown.`;

    const openClawIntent = await GeminiAiService.generateContent(prompt);
    const cleanIntent = openClawIntent.replace(/^["'\`]+|["'\`]+$/g, '').trim();

    logger.info(
      `🤖 Local Automator: Translated goal into Host Intent: "${cleanIntent}"`,
    );

    // 2. Delegate through the Cloud Proxy Tunnel
    try {
      const surrogateOutput = await openclawProxyService.delegateToLocalHost(
        cleanIntent,
        'Return the exact stdout, test execution results, or a summary of visual confirmation.',
      );

      // BaseSpecialistAgent requires a string return which it then wraps.
      return `[OPENCLAW SURROGATE LOCAL EXECUTION]\nIntent: ${cleanIntent}\nStatus: SUCCESS\nOutput:\n${surrogateOutput}`;
    } catch (error) {
      logger.error(
        `❌ Local Automator: Moltbot execution failed on physical host: ${error.message}`,
      );
      // Let the BaseSpecialistAgent circuit breaker catch and retry this if transient
      throw error;
    }
  }
}

export const openClawAgent = Object.freeze(new OpenClawAgent());
