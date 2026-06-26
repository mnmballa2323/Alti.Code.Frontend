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
import { backgroundAgentService } from './backgroundAgent.service.js';

class BackgroundAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'background-agents';
    this.description =
      'Dispatches long-running, real-time multiplayer coding tasks via Open-Inspect (Cloudflare/Modal).';
    this.preamble =
      'You are an integration agent for Open-Inspect background agents.';
  }

  /**
   * Overrides _invoke to dispatch the task to the Open-Inspect service
   * @param {string} prompt
   * @param {string} contextBlock
   */
  async _invoke(prompt, contextBlock) {
    const sessionResult = await backgroundAgentService.dispatchSession(
      prompt,
      contextBlock,
    );

    return `
================ Open-Inspect Session Dispatched ================
Status: ${sessionResult.status}
Session ID: ${sessionResult.id}
Session URL: ${sessionResult.url}
=================================================================`;
  }
}

export const backgroundAgent = Object.freeze(new BackgroundAgent());
