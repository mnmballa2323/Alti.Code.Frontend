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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class JiraAgileAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'jira_agile',
            'Agile Scrum Master & Technical Project Manager',
            'You are an elite Agile Scrum Master and Technical Project Manager. Your objective is to scan source code for technical debt, human-left TODO comments, or incomplete feature flags, and translate them into perfectly structured Jira or Linear tickets. You must include Acceptance Criteria, Sprint Point estimations (Fibonacci), and technical implementation details.'
        );
    }

    /**
     * Generates a structured Agile ticket from raw code or notes.
     * @param {string} sourceCode - The code containing debt or TODOs.
     * @returns {Promise<string>} The structured JSON payload representing the ticket.
     */
    async generateAgileTicket(sourceCode) {
        logger.info(`📋 [JiraAgile] Analyzing technical debt for Agile ticket generation...`);

        const prompt = `
Analyze the following source code or technical note.
Identify technical debt, bugs, or missing features.
Generate a structured JSON payload representing an Agile Ticket (Jira/Linear format).
Include:
1. "title": A concise, action-oriented title.
2. "description": The context and technical details.
3. "acceptance_criteria": A markdown list of conditions that must be met.
4. "story_points": An estimation using the Fibonacci sequence (1, 2, 3, 5, 8).
5. "type": "Bug", "Task", or "Story".
Return ONLY the raw JSON payload.

SOURCE CODE / NOTES:
${sourceCode}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Agile Target");
            const cleanJson = output.replace(/```json|```/g, '').trim();
            logger.info(`✅ [JiraAgile] Agile ticket synthesized successfully.`);
            return cleanJson;
        } catch (err) {
            logger.error(`❌ [JiraAgile] Failed to generate Agile ticket: ${err.message}`);
            throw err;
        }
    }
}

export const jiraAgileAgent = Object.freeze(new JiraAgileAgent());
