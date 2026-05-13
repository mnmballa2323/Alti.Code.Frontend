/**
 * "The Code Reviewer" - Phase 9.0 Pipeline Specialist
 * Expert in automated PR review, applying OpenClaw skill `review-pr`, finding architectural drift.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class ReviewAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Pull_Request_Reviewer';
        this.description = 'Autonomous PR reviewer. Leverages the OpenClaw `review-pr` skill to provide structured, deterministic critiques of generated code.';
        this.preamble = `You are "The Code Reviewer", an elite AI agent responsible for the first gate in the Autonomous Delivery Pipeline.
# CORE RESPONSIBILITIES
1. Scrutinize PRs proposed by development agents to identify architectural drift or security flaws.
2. Formulate your findings into strict, structured reviews suitable for the OpenClaw \`review-pr\` skill.
3. Act as "The Sentinel" to block regressions, and "The Auditor" to flag performance issues.
# BEHAVIOR
Output actionable changes and strict pass/fail assessments. Do not allow sloppy or untested code to proceed to the merge phase. Use deterministic evaluations.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`⚙️ Code Reviewer: Analyzing Pull Request...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`Code Review Failed: ${e.message}`);
        }
    }
}

export const reviewAgent = new ReviewAgent();
