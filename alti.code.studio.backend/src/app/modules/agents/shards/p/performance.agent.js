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

export class PerformanceAgent {
    constructor() {
        this.name = 'performance';
        this.description = 'Autonomous Staff Engineer and Big-O Optimizer';
        this.capabilities = [
            'Analyze code snippets for time and space complexity bottlenecks',
            'Identify O(N^2) nested loops and un-indexed search arrays',
            'Rewrite logic into optimal O(1) hash maps or O(log N) structures'
        ];
    }

    /**
     * Scans source code specifically for performance inefficiencies and rewrites the logic.
     * @param {string} sourceCode Target logic block
     * @param {string} language Language context
     */
    async optimizeComplexity(sourceCode, language = 'javascript') {
        logger.info(`⚡ Performance Agent: Scanning [${language}] logic block for Big-O bottlenecks...`);

        try {
            const prompt = `
            You are a Staff-Level Performance Engineer specializing in algorithmic complexity.
            Your task is to analyze the following ${language} code for severe performance degradation vectors (e.g., O(N^2) nested loops, blocking synchronous I/O, linear searches on massive arrays).

            Target Code:
            \`\`\`${language}
            ${sourceCode}
            \`\`\`

            Determine the current Big-O Time Complexity. If it is sub-optimal (e.g., O(N^2) when O(N) is possible), rewrite it.

            Return your findings as pure JSON:
            {
                "isOptimal": boolean,
                "currentComplexity": "e.g., O(N^2)",
                "bottleneckDescription": "Why is this slow?",
                "optimizedComplexity": "e.g., O(N) using a Hash Map",
                "optimizedCode": "The fully rewritten string of optimal code"
            }
            Do NOT include markdown formatting or ticks around the JSON output.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const perfReport = JSON.parse(reportJson);

            if (!perfReport.isOptimal) {
                logger.warn(`🐌 Performance Agent Alert: Detected sub-optimal logic [${perfReport.currentComplexity}].`);
                logger.info(`   Bottleneck: ${perfReport.bottleneckDescription}`);
                logger.info(`   Optimized to: [${perfReport.optimizedComplexity}]`);
            } else {
                logger.info(`⚡ Performance Agent: Code logic is already mathematically optimal [${perfReport.currentComplexity}].`);
            }

            return perfReport;

        } catch (err) {
            logger.error(`❌ Performance Agent Analysis Failed: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const code = state.data?.content || state.goal || "";
        const language = state.data?.context || "javascript";

        const report = await this.optimizeComplexity(code, language);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Big-O Optimization: ${report.currentComplexity} -> ${report.optimizedComplexity}`]
        };
    }
}

export const performanceAgent = Object.freeze(new PerformanceAgent());
