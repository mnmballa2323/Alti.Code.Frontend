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

export class DetectiveAgent {
    constructor() {
        this.name = 'detective';
        this.description = 'Autonomous Incident Responder and Debugger';
        this.capabilities = [
            'Ingest raw error logs and stack traces',
            'Cross-reference traces to identify the exact line of failure',
            'Output immediate Root Cause Analysis (RCA) and mitigation fixes'
        ];
    }

    /**
     * Reconstructs an incident based on an error log and reverse-engineers the Root Cause.
     * @param {string} error The raw error message
     * @param {string} stackTrace The system stack trace output
     * @param {string} code Relevant code snippets if discovered
     */
    async investigateIncident(error, stackTrace = '', code = '') {
        logger.info(`🕵️‍♀️ Detective Agent: Beginning Root Cause Analysis (RCA) for "${error.substring(0, 30)}..."`);

        try {
            const prompt = `
            You are an elite Site Reliability Engineer (SRE) / Incident Responder.
            A live production error has occurred. Your task is to perform an immediate Root Cause Analysis.

            INCIDENT DATA:
            Error: ${error}
            Stack Trace:
            ${stackTrace || 'None provided'}

            RELEVANT CODE:
            \`\`\`
            ${code || 'None provided'}
            \`\`\`

            Output a strict JSON object with your findings:
            {
                "rootCause": "Detailed explanation of why this system failed based on the stack",
                "immediateFix": "Actionable code change or infrastructure command to stop the bleeding",
                "preventionStrategy": "How to prevent this entirely moving forward",
                "confidence": number (0-100)
            }
            Do not include markdown code ticks around your JSON.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const rcaJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const analysis = JSON.parse(rcaJson);

            logger.info(`✅ Detective Agent: RCA Generated. Confidence: ${analysis.confidence}%`);
            return analysis;

        } catch (err) {
            logger.error(`❌ Detective Agent RCA Failure: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const errorMsg = state.data?.error || state.goal || "Unknown Failure";
        const stack = state.data?.stackTrace || "";
        const code = state.data?.code || "";

        const rca = await this.investigateIncident(errorMsg, stack, code);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `RCA Provided: ${rca.rootCause}`]
        };
    }
}

export const detectiveAgent = Object.freeze(new DetectiveAgent());
