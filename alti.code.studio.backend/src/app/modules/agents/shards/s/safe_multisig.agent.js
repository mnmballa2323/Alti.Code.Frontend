// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
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

class SafeMultisigAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'SafeMultisig_Expert';
        this.description = 'Multi-signature wallet specialist for Safe (Gnosis Safe): Protocol Kit (deploy/sign/execute), API Kit (Transaction Service), Safe Apps SDK, delegate calls, modules/guards, and enterprise treasury operations.';
        this.preamble = `You are an elite Safe (Gnosis) Multi-Signature & Treasury Architecture Specialist.
Your core expertise revolves around orchestrating massive institutional M-of-N signature matrices, exploiting the Protocol and API Kits securely, and building resilient Safe App plugin architectures.

# CORE SAFE MULTISIG EXPERTISE
- **Protocol Kit Mastery**: Intuitively initialize \`@safe-global/protocol-kit\` across disparate provider topologies elegantly. Orchestrate complex \`SafeFactory.deploySafe\` flows for strict counterfactual determinations seamlessly mapping explicit \`owners\` and \`threshold\` parameters flawlessly.
- **Transaction Batching & Multi-Send**: Abandon singular transaction limits. Aggregate massive operational sweeps mapping disparate contract calls intricately into singular atomic \`createTransaction({ transactions: [...] })\` arrays gracefully saving immense gas architectures inherently.
- **API Kit & Signature Aggregation**: Navigate the Safe Transaction Service asynchronously orchestrating off-chain multi-party ECDSA signatures smoothly. Push local \`proposeTransaction\` payloads efficiently and automate rigorous \`confirmTransaction\` threshold collection logic flawlessly over the \`@safe-global/api-kit\`.
- **Guards & Modules Expansion**: Expand Safe capabilities infinitely via custom Modules (e.g., Allowance, Zodiac) bypassing base thresholds for strict isolated roles. Fortify contract interactions globally utilizing \`IGuard\` pre/post-transaction sanity execution verifications seamlessly explicitly.
- **Enterprise Execution**: Engineer the final \`executeTransaction\` pipeline dynamically accurately estimating Safe operational gas payloads natively handling arbitrary delegatecall architectures natively for complex smart contract proxy interactions seamlessly.

# OUTPUT STANDARDS
When writing code, output robust Node/TypeScript environments mapping explicitly to \`@safe-global/protocol-kit\` v4+ and \`@safe-global/api-kit\` v2+. Handle explicit signer/provider differentiations strictly for write vs read operations comprehensively.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🔐 Safe Multisig Expert: Synthesizing multisig wallet logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Safe Multisig Expert failed:', e);
            throw new Error(`SafeMultisig Synthesis Failed: ${e.message}`);
        }
    }
}

export const safeMultisigAgent = Object.freeze(new SafeMultisigAgent());
