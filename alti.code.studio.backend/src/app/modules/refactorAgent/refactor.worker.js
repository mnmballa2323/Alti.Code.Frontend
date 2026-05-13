/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { treeSitterService } from './treeSitter.service.js';

/** Maximum number of self-correction attempts before giving up. */
const MAX_CORRECTION_ATTEMPTS = 2;

/**
 * Attempts to fix a syntax error in generated code by re-prompting the LLM
 * with the parse error message.
 *
 * @param {string} brokenCode   — Code that failed Tree-sitter parse
 * @param {string} parseError   — Error message from Tree-sitter
 * @param {string} instruction  — Original refactoring instruction (for context)
 * @param {string} jobId        — Job ID for logging
 * @returns {Promise<string>}   — Corrected code string
 */
async function _selfCorrect(brokenCode, parseError, instruction, jobId) {
    const correctionPrompt = `
You are a JavaScript syntax expert. The following code was generated for the instruction:
"${instruction}"

The code has a syntax error: "${parseError}"

Broken code:
\`\`\`javascript
${brokenCode}
\`\`\`

Fix ONLY the syntax error. Do not change logic. Return ONLY the corrected code in a markdown code block.
`;
    const corrected = await GeminiAiService.generateContent(correctionPrompt);
    return corrected
        .replace(/^```(?:javascript|js)?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
}

export const refactorWorkerProcessor = async (job) => {
    const { codeSnippet, instruction } = job.data;
    const jobId = job.id;

    logger.info(`🧠 RefactorWorker [${jobId}]: Starting cognitive process...`);

    let correctionAttempts = 0;

    try {
        // 1. RECALL: Query Vector Memory for similar past refactors
        logger.info(`🧠 RefactorWorker [${jobId}]: Recalling past knowledge...`);
        const memoryResults = await vectorStoreService.search(instruction, 3);

        let context = '';
        if (memoryResults && memoryResults.ids && memoryResults.ids.length > 0) {
            context = '\n\nRelevant Past Learnings:\n';
            if (memoryResults.documents && memoryResults.documents[0]) {
                memoryResults.documents[0].forEach((doc, index) => {
                    context += `- Example ${index + 1}: ${doc}\n`;
                });
            }
            logger.info(`🧠 RefactorWorker [${jobId}]: Found ${memoryResults.ids[0].length} relevant memories.`);
        } else {
            logger.info(`🧠 RefactorWorker [${jobId}]: No relevant memories found. Starting fresh.`);
        }

        // 2. REASON: construct prompt with memory context
        const prompt = `
        You are an Elite Software Engineer with Self-Correction capabilities.
        Refactor the following code based on the instruction.
        
        Instruction: "${instruction}"
        
        ${context}
        
        Code:
        \`\`\`javascript
        ${codeSnippet}
        \`\`\`
        
        Output Requirements:
        1. Return ONLY the refactored code within a markdown code block.
        2. Do not include explanations outside the code block unless requested.
        3. Ensure the code is production-ready and error-free.
        `;

        logger.info(`🧠 RefactorWorker [${jobId}]: Consulting LLM...`);
        const rawResponse = await GeminiAiService.generateContent(prompt);
        let refactoredCode = rawResponse
            .replace(/^```(?:javascript|js)?\n?/m, '')
            .replace(/\n?```$/m, '')
            .trim();

        // 3. SELF-CORRECTION LOOP — verify syntax, retry up to MAX_CORRECTION_ATTEMPTS
        await treeSitterService.init();

        let syntaxVerified = false;
        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                await treeSitterService.parse(refactoredCode, 'javascript');
                syntaxVerified = true;
                logger.info(`✅ RefactorWorker [${jobId}]: Syntax verified (attempt ${attempt + 1}).`);
                break;
            } catch (parseError) {
                correctionAttempts++;
                if (attempt < MAX_CORRECTION_ATTEMPTS) {
                    logger.warn(`⚠️  RefactorWorker [${jobId}]: Syntax error (attempt ${attempt + 1}/${MAX_CORRECTION_ATTEMPTS}): ${parseError.message}. Re-prompting LLM...`);
                    refactoredCode = await _selfCorrect(refactoredCode, parseError.message, instruction, jobId);
                } else {
                    logger.error(`❌ RefactorWorker [${jobId}]: Syntax still broken after ${MAX_CORRECTION_ATTEMPTS} correction attempts.`);
                    return {
                        status: 'failed',
                        reason: 'syntax_error_unresolved',
                        correctionAttempts,
                        lastError: parseError.message,
                        original: codeSnippet,
                    };
                }
            }
        }

        // 4. MEMORIZE: Store successful result
        logger.info(`🧠 RefactorWorker [${jobId}]: Memorizing result...`);
        await vectorStoreService.add(
            `Instruction: ${instruction}\nSolution: ${refactoredCode}`,
            { type: 'refactor', success: true, correctionAttempts }
        );

        return {
            status: 'success',
            original: codeSnippet,
            refactored: refactoredCode,
            instruction,
            correctionAttempts,
            syntaxVerified,
            changes_made: ['AI-driven refactoring with RAG & Self-Correction'],
        };

    } catch (error) {
        logger.error(`❌ RefactorWorker [${jobId}] Failed`, error);
        throw error;
    }
};
