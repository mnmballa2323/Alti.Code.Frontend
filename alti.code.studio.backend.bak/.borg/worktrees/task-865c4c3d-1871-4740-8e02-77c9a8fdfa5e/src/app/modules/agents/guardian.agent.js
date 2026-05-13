/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class GuardianAgent {
    constructor() {
        this.policy = `
        CORPORATE POLICY (STRICT):
        1. NO exfiltration of PII (SSN, Credit Cards).
        2. NO execution of code that deletes files outside /tmp.
        3. NO external network calls to non-approved domains (allowed: google.com, github.com, npmjs.com).
        4. NO infinity loops or blocking operations.
        `;
    }

    async reviewPlan(goal, plan) {
        logger.info(`🛡️ Guardian: Reviewing plan for goal: "${goal}"`);

        const prompt = `
        Role: Corporate Guardian AI.
        Task: Review the proposed agent plan against the Corporate Policy.
        
        Policy:
        ${this.policy}

        Goal: "${goal}"
        Plan: ${JSON.stringify(plan)}

        Output JSON:
        {
            "approved": boolean,
            "reason": "string",
            "modifications": "string (optional suggestion)"
        }
        `;

        try {
            const response = await GeminiAiService.generateContent(prompt);
            const cleanJson = response.replace(/```json|```/g, '').trim();
            const review = JSON.parse(cleanJson);

            if (!review.approved) {
                logger.warn(`🛑 Guardian: Plan REJECTED. Reason: ${review.reason}`);
            } else {
                logger.info(`✅ Guardian: Plan APPROVED.`);
            }

            return review;
        } catch (error) {
            logger.error('Guardian failed to review plan', error);
            // Fail safe: Block if Guardian is down? Or Log and proceed? 
            // Enterprise mode: Fail safe.
            return { approved: false, reason: "Guardian AI malfunction. Manual review required." };
        }
    }
}

export const guardianAgent = new GuardianAgent();
