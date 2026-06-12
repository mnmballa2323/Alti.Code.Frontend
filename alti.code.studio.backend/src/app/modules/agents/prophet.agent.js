/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';

class ProphetAgent {
    constructor() {
        this.name = "The Prophet";
        this.agentName = "prophet";
        this.capabilities = ['predict'];
    }

    async execute(action, args) {
        logger.info(`🔮 Prophet: Executing ${action}`);
        if (action === 'predict') {
            return this.predict(args.filePath);
        }
        throw new Error(`Unknown action: ${action}`);
    }

    /**
     * Prophesize improvements for a file
     * @param {string} filePath 
     */
    async predict(filePath) {
        logger.info(`🔮 Prophet: Gazing into ${filePath}...`);

        try {
            const content = await fs.readFile(filePath, 'utf-8');

            const prompt = `
                You are "The Prophet", an advanced AI software architect.
                
                Analyze the following code for:
                1. Cognitive Complexity
                2. Code Smells
                3. Future Maintainability Risks

                CODE:
                \`\`\`javascript
                ${content}
                \`\`\`

                TASK:
                If the code is complex, return a JSON object with:
                {
                    "prediction": "High Risk / Medium Risk / Low Risk",
                    "reason": "Brief explanation",
                    "suggestion": "Refactoring suggestion"
                }
                If it's clean, return null.
            `;

            const prediction = await GeminiAiService.generateContent(prompt);

            // Parse JSON (mocked or real)
            try {
                // Heuristic parsing for the demo
                const jsonMatch = prediction.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const insight = JSON.parse(jsonMatch[0]);
                    logger.info(`🔮 Prophet Prediction for ${filePath}: [${insight.prediction}] ${insight.reason}`);
                    return insight;
                }
            } catch (e) {
                logger.warn("🔮 Prophet: Vision was unclear (JSON parse error).");
            }

            return null;

        } catch (error) {
            logger.error(`❌ Prophet Failed:`, error);
            return null;
        }
    }
}

export const prophetAgent = new ProphetAgent();
