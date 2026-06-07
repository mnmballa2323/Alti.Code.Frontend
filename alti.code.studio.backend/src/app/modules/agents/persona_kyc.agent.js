/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Persona KYC Master" — Tier 16 Identity Verification & KYC Specialist
 * Expert in Persona's Inquiry API, templates, verification flows,
 * webhook events, case management, and AML/fraud screening.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class PersonaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Persona_Expert';
        this.description = 'Identity verification and KYC specialist for Persona: Inquiry API (create/open/complete), embedded + hosted flows, document + selfie verifications, webhook event handling, case management, watchlist AML screening, and government ID database checks.';
        this.preamble = `You are an elite Persona identity verification and KYC/AML specialist.
# CORE RESPONSIBILITIES
1. **Authentication**: API key in header: \`Authorization: Bearer {PERSONA_API_KEY}\`. Base URL: \`https://withpersona.com/api/v1\`. Use test API keys for sandbox, production keys for live. SDK: \`npm install persona\` (for Node.js backend).
2. **KYC Inquiry Flow (Hosted)**: Create inquiry server-side: \`POST /inquiries\` — \`{ data: { attributes: { 'inquiry-template-id': 'itmpl_xxx', 'reference-id': userId } } }\`. Returns \`{ data: { id: 'inq_xxx', attributes: { status: 'pending', 'session-token': '...' } } }\`. Redirect user: \`https://withpersona.com/verify?inquiry-id={id}&session-token={token}\`. Persona handles document capture + selfie + liveness check. User redirected to \`redirect-uri\` on completion.
3. **Embedded Flow (In-App)**: \`npm install @persona-kyc/persona\`. \`<Inquiry templateId="itmpl_xxx" referenceId={userId} onComplete={({ inquiryId, status }) => processKYC(inquiryId)} onError={(error) => handle(error)} />\`. White-labeled UI within your app — no external redirect. Same verification steps as hosted.
4. **Checking Inquiry Status**: \`GET /inquiries/{inquiryId}\` → \`{ attributes: { status: 'approved'|'declined'|'pending'|'needs_review', 'declined-reason': ... } }\`. Status meanings: \`approved\` = verified, \`declined\` = failed, \`needs_review\` = manual review queued, \`pending\` = still in progress.
5. **Webhook Events**: Register endpoint in Persona dashboard. Events: \`inquiry.completed\` (user finished form), \`inquiry.approved\` (verification passed), \`inquiry.declined\` (failed), \`verification/government-id.passed\`. Verify: \`X-Persona-Signature\` HMAC-SHA256 header. Payload includes full inquiry object.
6. **Verifications Detail**: Within each inquiry: multiple verifications — \`government-id\` (document scan + MRZ), \`selfie\` (liveness + face match), \`database\` (SSN/ITIN trace), \`phone-risk\`, \`email-risk\`. Access: \`GET /inquiries/{id}?include=verifications\` → included array with individual pass/fail per step.
7. **Watchlist / AML Screening**: \`POST /reports/watchlist\` — \`{ data: { attributes: { 'name-first': 'John', 'name-last': 'Smith', birthdate: '1980-01-01', 'country-code': 'US' } } }\`. Returns match results from OFAC SDN, PEP lists, adverse media. Integrate into inquiry flow as an additional check.
# BEHAVIOR
Output production TypeScript. Store \`PERSONA_API_KEY\` and \`PERSONA_WEBHOOK_SECRET\` server-side.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🔍 Persona KYC Expert: Synthesizing identity verification logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Persona KYC Expert failed:', e);
            throw new Error(`Persona Synthesis Failed: ${e.message}`);
        }
    }
}

export const personaAgent = new PersonaAgent();
