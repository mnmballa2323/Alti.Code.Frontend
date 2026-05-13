/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * The UX Critic Agent
 * A Visual QA Agent that "looks" at the application to find defects.
 */

import { logger } from '../../../shared/logger.js';
import { visionService } from '../senses/vision.service.js';

class UXCriticAgent {
    constructor() {
        this.name = "The Critic";
    }

    /**
     * Critique a live URL
     * @param {string} url 
     */
    async critique(url) {
        logger.info(`🧐 The Critic: Reviewing [${url}]...`);

        // 1. Capture Logic
        const screenshot = await visionService.capturePage(url);

        // 2. Vision Analysis
        const rubric = `
            Act as a Senior UX/UI Designer.
            Analyze this screenshot of a web application.
            Look for:
            - Alignment issues
            - Contrast/Accessibility problems
            - Broken images or layout shifts
            - Typography inconsistencies

            Return a standard JSON Report:
            {
                "score": 0-100,
                "issues": ["Issue 1", "Issue 2"],
                "praise": ["Good point 1"]
            }
        `;

        try {
            const analysisText = await visionService.analyze(screenshot, rubric);

            // Parse JSON from the response (handling potentially markdown wrapped json)
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            const report = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: analysisText };

            logger.info(`🧐 The Critic Report: Score ${report.score}`, report.issues);
            return report;

        } catch (error) {
            logger.error(`❌ The Critic Failed:`, error);
            return { error: error.message };
        }
    }
}

export const uxCriticAgent = new UXCriticAgent();
