/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class DebugAgent {
    constructor() {
        this.name = 'debug';
        this.description = 'The Omni-Debugger. Automated Stack Trace Resolution.';
        this.capabilities = [
            'Ingest raw crashing runtime stack traces and exceptions',
            'Locate the offending logic within the provided Abstract Syntax context',
            'Autonomously synthesize bug-fix patches and code replacements'
        ];
    }

    /**
     * Analyzes a runtime exception and a snippet of source code to generate a patch.
     * @param {string} stackTrace The raw error output
     * @param {string} sourceContext The surrounding source code where the crash originated
     */
    async debugException(stackTrace, sourceContext) {
        logger.info(`🐛 Debug Agent: Ingesting crash exception. Initiating Omni-Debug tracing protocol...`);

        try {
            const prompt = `
            You are an elite Senior Backend Engineer resolving a critical P1 bug.
            Analyze the following Stack Trace and trace it back to the underlying Source Code.
            
            Stack Trace:
            \`\`\`
            ${stackTrace}
            \`\`\`
            
            Source Code Context:
            \`\`\`
            ${sourceContext}
            \`\`\`

            Determine the root cause of the crash (e.g., missing null-check, off-by-one error).
            Provide a direct rewrite of the flawed logic.
            
            Return your findings as a strict JSON report:
            {
                "rootCause": "A 1-sentence explanation of what threw the exception.",
                "bugSeverity": "LOW | MEDIUM | HIGH | CRITICAL",
                "patchedCode": "The fully corrected Javascript source code block, ready to be deployed."
            }
            Do not wrap the JSON output in markdown formatting.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const debugReport = JSON.parse(reportJson);

            logger.warn(`🐛 Debug Agent Alert [${debugReport.bugSeverity}]: ${debugReport.rootCause}`);
            logger.info(`   Patch has been synthesized.`);

            return debugReport;

        } catch (err) {
            logger.error(`❌ Debug Agent Tracing Failed: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const error = state.data?.content || "Unknown Error";
        const code = state.data?.context || "";

        const report = await this.debugException(error, code);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `Bug Patched [${report.bugSeverity}]`]
        };
    }
}

export const debugAgent = new DebugAgent();
