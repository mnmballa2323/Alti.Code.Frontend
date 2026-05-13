/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { logger } from '../../../shared/logger.js';
import { VectorMemory } from '../../shared/memory.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

class ContextService {

    /**
     * Answer a question using RAG (Retrieval Augmented Generation)
     * @param {string} userQuery - The user's question
     * @param {object} options - { limit: 5, contextType: 'code' }
     */
    async query(userQuery, options = {}) {
        const limit = options.limit || 5;
        logger.info(`🧠 Context: Analyzing query: "${userQuery}"`);

        try {
            // 1. Retrieve Context
            // VectorMemory.search handles embedding generation internally now?
            // Wait, VectorMemory.search(query, limit) calls getEmbedding internally in my recent refactor?
            // Yes: `const embedding = await vertexService.getEmbeddings(query);` inside VectorMemory.search

            const results = await VectorMemory.search(userQuery, limit);

            if (!results || results.length === 0) {
                return {
                    answer: "I couldn't find any relevant context in the codebase to answer your question.",
                    references: []
                };
            }

            // 2. Construct Prompt
            const contextBlock = results.map((r, i) => {
                return `[REFERENCE ${i + 1}] File: ${r.metadata.filePath}\nContent:\n${r.content}\n`;
            }).join('\n---\n');

            // Load .altirules if exists
            let projectRules = "";
            try {
                projectRules = await fs.readFile('.altirules', 'utf-8');
            } catch (e) {
                // Ignore missing rules
            }

            const prompt = `
            You are the Cortex, the collective intelligence of this codebase.
            
            PROJECT RULES (Must Follow):
            ${projectRules}

            Context from the codebase:
            ${contextBlock}
            
            User Question: ${userQuery}
            
            Instructions:
            1. Answer the question primarily based on the provided context.
            2. If the context is insufficient, state what is missing, but try to infer from general knowledge if safe.
            3. Cite specific files (e.g. "In src/utils.js...") when explaining code.
            4. Be concise but technical.
            `;

            // 3. Generate Answer
            const answer = await GeminiAiService.generateContent(prompt);

            return {
                answer: answer,
                references: results.map(r => r.metadata.filePath)
            };

        } catch (error) {
            logger.error('Context Service Query Error', error);
            return {
                answer: "Sorry, I encountered an error while processing your request.",
                error: error.message
            };
        }
    }
}

export const contextService = new ContextService();
