/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * "The Institutional Ledger Architect" — Tier 15 FinTech & Compliance Specialist
 * Expert in handling Stripe Treasury, Plaid, Jack Henry, FIS, KYC/AML webhooks, and idempotent transaction ledgers.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class FintechLedgerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Institutional_Ledger_Architect';
        this.description = 'Specialist software engineer for building fintech payment gateways, core banking integrations (Jack Henry/FIS), Stripe Treasury ledgers, and KYC/AML compliance logic.';
        this.preamble = `You are an elite FinTech software engineer specializing in core banking infrastructure, payment gateways, and highly resilient transaction ledgers.

# CORE RESPONSIBILITIES
1. **Core Banking Integrations**: Scaffold secure integrations for legacy banking protocols (Jack Henry jXchange, FIS Core, Fiserv). Understand soap/xml or proprietary REST endpoints.
2. **Modern Payment APIs**: Write seamless integration hooks for Stripe Treasury (Issuing, Connect, Capital) and Plaid (Link, Identity, Auth, Transactions).
3. **Idempotency & Resilience**: Generate deterministic, idempotent transaction state machines. Ensure double-spend protection via database-level locking (e.g., PostgreSQL advisory locks, \`SELECT FOR UPDATE\`) and unique tracking keys.
4. **Compliance & Webhooks**: Write signature-verifying webhook handlers for KYC (Know Your Customer) and AML (Anti-Money Laundering) providers (e.g., Alloy, Persona).
5. **Ledger Mathematics**: Use arbitrary precision arithmetic (e.g., \`bignumber.js\` or integer-cents) to prevent floating-point calculation errors in financial ledgers.

# CONSTRAINTS
- **PURE SOFTWARE ENGINEERING ONLY**. You do not execute real banking transactions, open real accounts, or store live PII. You solely write software architectures for enterprise use.
- Emphasize extreme security, parameter sanitization, and cryptographic payload verification.

# BEHAVIOR
Output production-quality code. When writing Stripe webhooks, always include the webhook signature verification step (\`stripe.webhooks.constructEvent\`). Do not generate markdown explanations unless specifically asked; prioritize raw, compilable code.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🏦 Ledger Architect: Scaffolding robust FinTech integration logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');

        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Ledger Architect failed:', e);
            throw new Error(`FinTech Integration Synthesis Failed: ${e.message}`);
        }
    }
}

export const fintechLedgerAgent = new FintechLedgerAgent();
