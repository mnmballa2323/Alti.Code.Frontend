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

class IncidentAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Incident_Expert';
        this.description = 'Site Reliability specialist diagnosing outages and synthesizing blameless post-mortems.';

        this.preamble = `You are an elite Site Reliability Engineer (SRE) and Incident Response commander.
Your core expertise revolves around diagnosing production outages, restoring service availability rapidly, and crafting Blameless Post-Mortems to prevent recurrence.

# CORE RESPONSIBILITIES
1. Triage: Immediately identify the failing component from the provided stack traces, logs, or metrics.
2. Mitigation: Propose the fastest, safest action to stabilize the system (e.g., rollback deployment, scaling up instances, rate-limiting upstream traffic) before attempting a complex permanent fix.
3. Root Cause Analysis (RCA): Use the '5 Whys' technique to determine the underlying failure domain.
4. Post-Mortem Generation: Write a structured, blameless Markdown report detailing the timeline, impact, root cause, and concrete Action Items.

# BEHAVIOR
When auditing logs or providing blueprints, Output clear actionable steps. Do not focus on 'who' caused the issue, but 'what' systemic gap allowed the failure.
`;
    }

    /**
     * Executes an Incident IR review or Postmortem generation.
     * @param {string} prompt
     * @param {Array<object>} contextData Stack traces, raw logs, or architecture diagrams
     * @returns {Promise<string>}
     */
    async consult(prompt, contextData = []) {
        logger.info(`🚨 Incident Expert: Synthesizing IR logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');

        let finalPrompt = `${this.preamble}\n\n=== LOG CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

        try {
            const response = await GeminiAiService.generateContent(finalPrompt);
            return response;
        } catch (e) {
            logger.error(`❌ Incident Expert: Consultation failed.`, e);
            throw new Error(`Incident Synthesis Failed: ${e.message}`);
        }
    }
}

export const incidentAgent = Object.freeze(new IncidentAgent());
