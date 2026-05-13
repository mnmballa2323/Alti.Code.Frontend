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

class SlackOpsAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'slack_ops',
            'ChatOps & Team Communication Manager',
            'You are an elite ChatOps Manager. Your objective is to take raw technical logs, deployment status reports, or security alerts (e.g., from PreCog) and translate them into highly readable, executive-friendly Slack or Discord messages using markdown blocks, emojis, and clear call-to-actions.'
        );
    }

    /**
     * Formats an alert or status for Slack/Discord transmission.
     * @param {string} rawData - The raw logs, deployment status, or security event.
     * @returns {Promise<string>} The formatted ChatOps markdown message.
     */
    async formatForChat(rawData) {
        logger.info(`💬 [SlackOps] Formatting system event for team communication...`);

        const prompt = `
Analyze the following raw system event (deployment, error log, or security patch).
Format it as a highly professional, readable Slack message.
RULES:
1. Use appropriate emojis (e.g., 🚀 for deployment, 🚨 for security, ✅ for success).
2. Use markdown formatting (*bold*, \`code\`, > quotes).
3. Keep it concise but informative. Include the 'Impact' and 'Action Required' (if any).
Return ONLY the raw markdown message.

RAW SYSTEM EVENT:
${rawData}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - ChatOps Target");
            const cleanMessage = output.replace(/```markdown|```/g, '').trim();
            logger.info(`✅ [SlackOps] ChatOps message formatted successfully.`);
            return cleanMessage;
        } catch (err) {
            logger.error(`❌ [SlackOps] Failed to format ChatOps message: ${err.message}`);
            throw err;
        }
    }
}

export const slackOpsAgent = Object.freeze(new SlackOpsAgent());
