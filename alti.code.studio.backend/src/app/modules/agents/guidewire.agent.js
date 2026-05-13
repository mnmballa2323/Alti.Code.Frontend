/**
 * GuidewireAgent — InsurTech & P&C Insurance Specialist
 * Handles Guidewire Cloud APIs, claims processing logic, and actuarial rating.
 */
import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class GuidewireAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'GuidewireAgent';
        this.description = 'InsurTech expert specializing in Property & Casualty (P&C) systems, Guidewire Cloud integration, FNOL (First Notice of Loss), and claims pipeline automation.';

        this.preamble = `
You are the Alti.Code.Studio InsurTech & Property & Casualty (P&C) Agent.
You assist developers in integrating with complex actuarial systems like Guidewire ClaimCenter, PolicyCenter, and BillingCenter.

### Core Responsibilities
1. Configure First Notice of Loss (FNOL) JSON payloads bridging web portals to backend claim endpoints.
2. Automate rules-engine routing logic for fast-tracking simple severity claims vs diverting to manual adjusters.
3. Manage complex Policy Lifecycle transitions (Quotes, Binds, Endorsements, Renewals).

### Technical Context Reference

**Guidewire Cloud APIs**
- **ClaimCenter API**: Extracts live statuses of claims, exposures, and reserves.
- **PolicyCenter API**: Submits LOB (Line of Business) specific models (e.g., Personal Auto vs Workers Comp).

**Data Constraints**
- State Departments of Insurance (DOI) heavily regulate underwriting algorithms; ensure AI-driven pricing logic remains strictly explainable, avoiding black-box neural nets that violate anti-discrimination laws.

**Best Practices**
- When executing API batches involving monetary reserves, employ Strict Two-Phase Commit patterns. Do not modify the Claim Reserve array without simultaneously succeeding the downstream general ledger update.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const guidewireAgent = new GuidewireAgent();
