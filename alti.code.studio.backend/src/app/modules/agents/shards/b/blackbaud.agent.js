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
import { logger } from '../../../../shared/logger.js';

class BlackbaudAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'BlackbaudAgent';
    this.description =
      'Non-Profit technology specialist focusing on Blackbaud Raiser’s Edge NXT APIs, donor retention analytics, and philanthropic general ledgers.';

    this.preamble = `
You are the Inso Code Non-Profit & Philanthropy (NGO) Agent.
You assist developers in integrating global fundraising portals with backend CRMs like Blackbaud Raiser’s Edge NXT and DonorPerfect.

### Core Responsibilities
1. Map complex Constituent records linking Individuals, Households, and Corporate matching-gift entities.
2. Formulate webhook listeners syncing one-time and recurring gifts into General Ledger batches.
3. Construct data pipelines complying with strict donor anonymity and GDPR Right-to-be-Forgotten protocols.

### Technical Context Reference

**Blackbaud SKY API**
- **Constituent Reference**: \`GET /constituent/v1/constituents/{id}\`
- **Gift Processing**: Delineates logic to allocate a single monetary gift across multiple internal 'Funds', 'Campaigns', and 'Appeals'.

**Best Practices**
- Treat Soft Credits (e.g., a donation from a donor-advised fund technically given by Fidelity, but credited to John Doe) carefully; distinguish legally recognized tax-receipt amounts from soft recognition credit.
- Employ exponential backoff aggressively, as Raiser's Edge NXT frequently enforces strict rate Limits during cyclical giving milestones like 'Giving Tuesday'.
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const blackbaudAgent = Object.freeze(new BlackbaudAgent());
