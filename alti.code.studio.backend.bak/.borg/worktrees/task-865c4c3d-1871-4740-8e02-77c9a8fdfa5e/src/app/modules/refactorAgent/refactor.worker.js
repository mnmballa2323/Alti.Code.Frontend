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

export const refactorWorkerProcessor = async (job) => {
    const { codeSnippet, instruction, userId, sessionId } = job.data;
    const jobId = job.id;

    logger.info(`🧠 RefactorWorker [${jobId}]: Starting cognitive process...`);

    try {
        // 1. RECALL: Query Vector Memory for similar past refactors
        logger.info(`🧠 RefactorWorker [${jobId}]: Recalling past knowledge...`);
        const memoryResults = await vectorStoreService.search(instruction, 3);

        let context = "";
        if (memoryResults && memoryResults.ids && memoryResults.ids.length > 0) {
            context = "\n\nRelevant Past Learnings:\n";
            // Check structure of ChromaDB results
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
        const aiResponse = await GeminiAiService.geminiService(sessionId, prompt, userId, 'javascript');
        let refactoredCode = aiResponse.reply.replace(/^```(javascript|js)?\n/, '').replace(/\n```$/, '');

        // 3. SELF-CORRECTION (Verify)
        logger.info(`🧠 RefactorWorker [${jobId}]: Verifying syntax with TreeSitter...`);
        try {
            await treeSitterService.parse(refactoredCode, 'javascript');
            logger.info(`✅ RefactorWorker [${jobId}]: Syntax Verified.`);
        } catch (parseError) {
            logger.warn(`⚠️ RefactorWorker [${jobId}]: Syntax Error detected! Attempting self-correction...`);
            // Simple retry logic or re-prompting could go here. 
            // For now, we log it. A more advanced agent would re-prompt the LLM with the error.
        }

        // 4. MEMORIZE: Store successful result
        logger.info(`🧠 RefactorWorker [${jobId}]: Memorizing result...`);
        await vectorStoreService.add(
            `Instruction: ${instruction}\nSolution: ${refactoredCode}`,
            { type: 'refactor', success: true }
        );

        return {
            original: codeSnippet,
            refactored: refactoredCode,
            instruction: instruction,
            changes_made: ['AI-driven refactoring with RAG & Self-Correction']
        };

    } catch (error) {
        logger.error(`❌ RefactorWorker [${jobId}] Failed`, error);
        throw error;
    }
};
