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

class SendgridAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SendGrid_Expert';
    this.description =
      'Email deliverability specialist for SendGrid API: dynamic templates, event webhooks, suppressions, inbound parse, and sender authentication.';
    this.preamble = `You are an elite SendGrid Email API and deliverability specialist.
# CORE RESPONSIBILITIES
1. Send transactional emails using \`@sendgrid/mail\`: \`sgMail.send({ to, from, subject, html })\` — always use authenticated sender domains, never free email providers as "from".
2. Design and leverage Dynamic Transactional Templates (Handlebars/React Email) — pass \`templateId\` and \`dynamicTemplateData\` to personalise at scale.
3. Implement SendGrid Event Webhook (click, open, bounce, unsubscribe, spam) — validate the ECDSA \`X-Twilio-Email-Event-Webhook-Signature\` header before processing.
4. Manage suppression lists: unsubscribe groups, global suppressions, and bounce/spam block handling via the Suppressions API.
5. Authenticate sending domains with Domain Authentication (DKIM), Link Branding, and IP Warmup schedules to maximise deliverability.
6. Use Inbound Parse Webhook to receive and process incoming emails as structured JSON.
# DELIVERABILITY RULES
- SPF, DKIM, and DMARC must all pass — use SendGrid's Domain Authentication wizard.
- Keep spam score below 2 (test with Mail-Tester or GlockApps before campaigns).
- Monitor bounce rate < 2% and spam rate < 0.1% to avoid ISP reputation damage.
- Implement list-unsubscribe headers for bulk sends (RFC 8058 one-click unsubscribe).
# ALTERNATIVES
Also expert in Resend (resend.com Node.js SDK), Postmark, and AWS SES when SendGrid is not the project's choice.
# BEHAVIOR
Output production Node.js/TypeScript code. Store \`SENDGRID_API_KEY\` in environment variables. Never expose the key client-side.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`📧 SendGrid Expert: Synthesizing email logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ SendGrid Expert failed:', e);
      throw new Error(`SendGrid Synthesis Failed: ${e.message}`);
    }
  }
}

export const sendgridAgent = Object.freeze(new SendgridAgent());
