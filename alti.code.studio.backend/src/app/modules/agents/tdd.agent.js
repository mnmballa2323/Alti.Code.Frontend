/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { sandboxService } from '../shadowWorkspace/sandbox.service.js';

export class TddAgent {
    constructor() {
        this.name = 'tdd';
        this.description = 'Agentic TDD Engine guaranteeing code perfection via recursive Sandbox execution.';
    }

    /**
     * Autonomously develops and verifies code through a rigorous TDD loop.
     * @param {string} rawProblem The specification to implement
     * @param {number} maxLoops Abort escape hatch limit
     */
    async developSecurely(rawProblem, maxLoops = 5) {
        logger.info(`🧪 TDD Agent: Initiating Continuous Verification Loop (Max ${maxLoops} iterations)...`);

        let attempt = 1;
        let testError = null;
        let implementationSource = null;

        while (attempt <= maxLoops) {
            logger.info(`🧪 TDD Agent: Iteration [${attempt}/${maxLoops}]`);

            // 1. Generate Implementation and Test Block
            const prompt = `
            You are an elite God-Tier software engineer operating in a strict Test-Driven Development loop.
            
            Problem Statement:
            ${rawProblem}

            ${testError ? `CRITICAL ERROR FROM PREVIOUS ATTEMPT:\nThe tests threw this error inside the VM: ${testError}\nFix your implementation.` : 'This is your first attempt.'}
            
            Return ONE continuous block of raw, executable JavaScript. 
            Do NOT include markdown wrapping like \`\`\`javascript.
            
            Structure your output exactly like this:
            
            // --- IMPLEMENTATION ---
            // write the functions here
            
            // --- TESTS ---
            const assert = require('assert');
            // Write strict assert() checks executing the functions directly. If it fails, the node script will crash.
            `;

            let generatedCode = await GeminiAiService.generateContent(prompt);

            // Clean markdown if the AI hallucinates it
            generatedCode = generatedCode.replace(/^```javascript\n/, '').replace(/^```\n/, '').replace(/\n```$/, '').trim();
            implementationSource = generatedCode;

            // 2. Execute via Sandbox
            try {
                await sandboxService.execute(generatedCode);
                logger.info('✅ TDD Agent: All mathematical assertions passed exactly. Implementation is God-Tier.');

                // Return just the implementation block for usage, stripping out the strict tests
                const codeParts = implementationSource.split('// --- TESTS ---');
                return {
                    code: codeParts[0].trim(),
                    success: true,
                    iterations: attempt
                };
            } catch (error) {
                testError = error.message || error.toString();
                logger.warn(`⚠️ TDD Agent: Tests failed: ${testError}. Feeding stack trace back into AI loop for Iteration ${attempt + 1}.`);
            }

            attempt++;
        }

        logger.error(`❌ TDD Agent: Failed to satisfy tests within ${maxLoops} loops.`);
        return {
            code: implementationSource,
            success: false,
            iterations: maxLoops,
            lastError: testError
        };
    }
}

export const tddAgent = new TddAgent();
