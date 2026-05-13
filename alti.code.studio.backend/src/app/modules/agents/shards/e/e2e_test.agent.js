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

import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class E2ETestAgent {
    constructor() {
        this.name = 'e2e';
        this.description = 'Autonomous End-to-End Test Synthesizer';
        this.capabilities = [
            'Parse semantic User Journeys describing frontend interactions',
            'Synthesize robust Playwright browser automation scripts natively',
            'Identify un-tested critical paths across the UI fabric'
        ];
    }

    /**
     * Synthesizes an executable Playwright testing script based on a description of a user journey.
     * @param {string} userJourney Plain-text description of what the user does
     * @param {string} targetUrl The base URL to test against
     */
    async generateTestScript(userJourney, targetUrl = 'http://localhost:3000') {
        logger.info(`🧪 E2E Agent: Drafting Playwright browser automation for journey: "${userJourney.substring(0, 30)}..."`);

        try {
            const prompt = `
            You are a Senior QA Automation Engineer.
            Your task is to write a complete, robust Playwright (Node.js) test script that validates the following User Journey.
            Assume the application is hosted at URL: ${targetUrl}

            User Journey to Automate:
            "${userJourney}"

            Write the Playwright script using modern async/await syntax. Include robust assertions (expect).

            Return your output as a pure JSON object:
            {
                "success": boolean,
                "journeyUnderstanding": "Brief sentence explaining what you are testing",
                "playwrightScript": "The complete javascript string containing the executable Playwright test."
            }
            Do not enclose the JSON inside markdown ticks. Return raw JSON.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const e2eReport = JSON.parse(reportJson);

            logger.info(`✅ E2E Agent: Synthetic Playwright testing script generated successfully.`);

            return e2eReport;

        } catch (err) {
            logger.error(`❌ E2E Agent Synthesis Failed: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const journey = state.data?.content || state.goal || "";
        const url = state.data?.context || "http://localhost:3000";

        const report = await this.generateTestScript(journey, url);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Written E2E Spec for: ${report.journeyUnderstanding}`]
        };
    }
}

export const e2eTestAgent = Object.freeze(new E2ETestAgent());
