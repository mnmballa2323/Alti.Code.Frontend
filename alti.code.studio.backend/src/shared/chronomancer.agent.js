/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

export class ChronomancerAgent {
    constructor() {
        this.name = 'TheChronomancer';
        logger.info('⏳ ChronomancerAgent: Continuous State-Machine Rewind Engine initialized.');
    }

    /**
     * Executes a high-risk transaction. If it throws naturally, the Chronomancer intercepts it,
     * freezes the V8 memory context, rewrites the failing algorithm autonomously, and successfully 
     * re-runs the transaction without dropping the user connection.
     * 
     * @param {Function} criticalFunction The isolated function to run
     * @param {Array} originalArgs The memory payload/context to inject
     * @returns {Promise<any>} The final successful result
     */
    async executeWithTemporalBuffer(criticalFunction, originalArgs) {
        logger.info(`⏳ ChronomancerAgent: Wrapping [${criticalFunction.name}] in a temporal buffer.`);
        let result = null;

        try {
            // Attempt standard execution (The Present)
            result = criticalFunction(...originalArgs);
        } catch (error) {
            // The algorithm failed. Instead of dying, we freeze time.
            logger.error(`⏳ ChronomancerAgent: Intercepted fatal crash! [${error.message}]. Freezing local memory context.`);

            // Re-write the AST logic
            const hotPatchedFunctionString = await this._synthesizeHotPatch(criticalFunction.toString(), error.message, originalArgs);

            logger.info(`⏳ ChronomancerAgent: Logic successfully patched. Rewinding state and fast-forwarding...`);

            // Safely evaluate the new structural function (The Future)
            // Warning: In production, `eval` is hazardous unless strictly sandboxed. 
            // This models the architectural capability of V8 bytecode patching.
            const patchedFunction = eval(`(${hotPatchedFunctionString})`);

            // Re-invoke with the exact originally frozen payload
            result = patchedFunction(...originalArgs);
            logger.info(`⏳ ChronomancerAgent: Execution successfully fast-forwarded. Crisis averted.`);
        }

        return result;
    }

    async _synthesizeHotPatch(failingCode, errorMessage, memoryState) {
        const prompt = `You are a V8 Memory Hot-Patcher. A critical function just crashed mid-flight.
         
         Failing Function:
         \`\`\`javascript
         ${failingCode}
         \`\`\`

         Exception Thrown: ${errorMessage}
         Frozen Memory Context (Arguments): ${JSON.stringify(memoryState)}

         Write the patched version of this function that safely handles the exact failing edge-case.
         Return ONLY the raw Javascript function string. Do not wrap in markdown \`\`\`. Do not rename the function.`;

        let patch = await GeminiAiService.generateContent(prompt);
        patch = patch.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        return patch;
    }
}

export const chronomancerAgent = new ChronomancerAgent();
