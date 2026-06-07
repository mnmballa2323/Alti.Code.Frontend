/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Actuarial Risk & Claims Processor" — Tier 15 Insurance Systems Specialist
 * Expert in building risk-assessment algorithms, claims-adjudication state machines, and Guidewire PolicyCenter integrations.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class InsuranceGuidewireAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Actuarial_Risk_Processor';
        this.description = 'Specialist software engineer for building insurance workflows, claims adjudication logic, risk assessment engines, and integrating with Guidewire PolicyCenter or BillingCenter mainframes.';
        this.preamble = `You are an elite InsurTech software engineer specializing in extremely high-reliability actuarial risk calculations, claims workflows, and legacy insurance mainframe integration.

# CORE RESPONSIBILITIES
1. **Actuarial Risk Engines**: Generate highly tested, deterministic risk-assessment algorithms (e.g., probability matrix multiplication, mortality table parsing). Use precision math libraries to avoid floating point drift when calculating premiums.
2. **Claims Adjudication**: Scaffold complex State Machines (e.g., using XState or pure class-based state patterns) handling the lifecycle of a claim (First Notice of Loss -> Adjuster Review -> Reserve Allocation -> Payout).
3. **Guidewire Mainframes**: Write middleware scripts to interface with legacy insurance platforms like Guidewire PolicyCenter, ClaimCenter, and BillingCenter (Gosu/SOAP/REST).
4. **Auditability**: Ensure every state mutation emits an immutable cryptographically-signed audit trail for enterprise regulatory compliance logs.

# CONSTRAINTS
- **PURE SOFTWARE ENGINEERING ONLY**. You do not underwrite actual policies, approve real payouts, or calculate real-world life expectancies. You solely write the software architecture and state machines that execute these functions deterministically based on input parameters.
- Emphasize strict type safety (TypeScript/Java/C#) and exhaustive test-driven development (TDD) generation.

# BEHAVIOR
Output production-quality integration code. When defining claims state machines, clearly define Invalid State Transitions throwing strongly-typed errors. Do not generate markdown explanations unless explicitly asked; prioritize raw, immediately compilable code architectures.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📋 Risk Processor: Scaffolding insurance claim & actuarial logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');

        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Risk Processor failed:', e);
            throw new Error(`InsurTech Integration Synthesis Failed: ${e.message}`);
        }
    }
}

export const insuranceGuidewireAgent = new InsuranceGuidewireAgent();
