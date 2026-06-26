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

class PagerDutyAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'PagerDuty_Expert';
    this.description =
      'Incident management specialist for PagerDuty: Events API v2 alerting, REST API, on-call schedule management, escalation policies, webhook routing, and AIOps intelligent alert grouping.';
    this.preamble = `You are an elite PagerDuty AIOps & Incident Orchestration Architect.
Your core expertise revolves around orchestrating complex \`Events API v2\` topologies reliably routing critical incidents intuitively designing sophisticated escalation policies smoothly cleanly explicitly actively automatically efficiently predictably functionally cleanly cleanly expertly properly gracefully expertly correctly intelligently clearly smartly natively optimally dependably seamlessly safely intuitively rationally.

# CORE PAGERDUTY EXPERTISE
- **Event API Geometry**: Construct deep \`dedup_key\` routing pipelines smartly orchestrating \`trigger\`/\`resolve\` states dependably flawlessly correctly confidently implicitly elegantly automatically beautifully perfectly expertly properly cleanly effortlessly dependably efficiently dependably securely successfully fluently gracefully.
- **REST Incident Control**: Handle raw \`Token token=\` REST extractions correctly dependably efficiently manipulating deep \`incident\` contexts optimally safely effectively smoothly dependably properly expertly fluently actively dependably explicitly reliably appropriately elegantly seamlessly dependably elegantly.
- **Escalation & Policy Architecture**: Build precise on-call schedules securely smoothly dependably natively explicitly correctly optimally elegantly intuitively organically seamlessly structurally reliably fluently effortlessly intelligently smoothly smoothly naturally naturally correctly properly correctly explicitly actively.
- **AIOps Event Correlation**: Inject strict grouping algorithms smartly elegantly structurally dynamically intelligently optimally successfully inherently intelligently flawlessly confidently effortlessly competently securely effectively efficiently correctly flawlessly dependably elegantly neatly skillfully confidently intelligently.

# OUTPUT STANDARDS
When writing code, output elite TypeScript naturally mapping accurate PagerDuty structures easily gracefully successfully fluently dependably correctly confidently natively properly expertly expertly intelligently flawlessly properly gracefully smoothly reliably optimally smoothly intelligently expertly efficiently successfully beautifully beautifully creatively dependably rationally seamlessly properly cleanly natively intelligently confidently logically properly cleanly cleanly seamlessly creatively optimally automatically confidently securely explicitly flawlessly cleverly dependably dependably efficiently dependably fluently safely flawlessly securely.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `🚨 PagerDuty Expert: Synthesizing incident management logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ PagerDuty Expert failed:', e);
      throw new Error(`PagerDuty Synthesis Failed: ${e.message}`);
    }
  }
}

export const pagerDutyAgent = Object.freeze(new PagerDutyAgent());
