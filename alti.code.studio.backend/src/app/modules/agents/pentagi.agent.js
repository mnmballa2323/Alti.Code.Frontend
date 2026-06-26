/**
 * Copyright (c) 2024 Inso Code
 *
 * pentagi.agent.js — vxcontrol/pentagi Wrapper Agent
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { pentagiService } from './pentagi.service.js';

class PentagiAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'pentagi';
    this.description =
      'Autonomous Deep Penetration Testing and Security Auditing via isolated PentAGI containers.';
    this.preamble =
      'You are an integration agent for the PentAGI (Penetration testing AGI) framework. You coordinate automated red-teaming, vulnerability scanning, and exploitation tests inside a secure Docker sandbox.';
  }

  /**
   * Overrides _invoke to dispatch the task to the PentAGI API service
   * @param {string} prompt
   * @param {string} contextBlock
   */
  async _invoke(prompt, contextBlock) {
    const flowResult = await pentagiService.startFlow(prompt, contextBlock);

    return `
================ PentAGI Pentest Flow Dispatched ================
Status: ${flowResult.status}
Flow ID: ${flowResult.id}
Dashboard: ${flowResult.dashboardUrl}
Note: Penetration testing is running autonomously in the backend. 
=================================================================`;
  }
}

export const pentagiAgent = new PentagiAgent();
