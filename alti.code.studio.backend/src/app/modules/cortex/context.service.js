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

const MAX_HISTORY = 10;

class ContextService {
    constructor() {
        this.conversationHistory = [];
        this.dependencyGraph = new Map(); // "FileA" -> Set<"FileB", "FileC">
        this.lessons = new Map();         // category -> Set<insight>
    }

    /**
     * Register a dependency relationship.
     * @param {string} fromFile
     * @param {string} toFile
     */
    addDependency(fromFile, toFile) {
        if (!this.dependencyGraph.has(fromFile)) {
            this.dependencyGraph.set(fromFile, new Set());
        }
        this.dependencyGraph.get(fromFile).add(toFile);
    }

    /**
     * Learn a new lesson.
     * @param {string} category - e.g. "security", "performance", "style"
     * @param {string} insight  - The lesson learned
     */
    addLesson(category, insight) {
        if (!this.lessons.has(category)) {
            this.lessons.set(category, new Set());
        }
        this.lessons.get(category).add(insight);
        logger.info(`🎓 Context: Learned new lesson in [${category}]: "${insight}"`);
    }

    /**
     * Return a trimmed copy of the current conversation history.
     * Useful for external inspection and testing.
     * @returns {{ role: string, content: string }[]}
     */
    getHistory() {
        return [...this.conversationHistory];
    }

    /**
     * Answer a question using RAG (Retrieval Augmented Generation) + Graph.
     * @param {string} userQuery - The user's question
     * @param {object} options   - { limit: 5 }
     */
    async query(userQuery, options = {}) {
        if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
            return {
                answer: 'Query must be a non-empty string.',
                references: [],
                graphInfo: 'None',
            };
        }
        const limit = options.limit || 5;
        logger.info(`🧠 Context: Analyzing query: "${userQuery}"`);

        try {
            // 0. Update conversation history with sliding-window trim
            this.conversationHistory.push({ role: 'user', content: userQuery });
            if (this.conversationHistory.length > MAX_HISTORY) {
                // slice to last MAX_HISTORY entries in one operation
                this.conversationHistory = this.conversationHistory.slice(-MAX_HISTORY);
            }

            // 1. Retrieve Vector Context (Semantic Search)
            let results = [];
            try {
                results = await VectorMemory.search(userQuery, limit);
            } catch (vectorError) {
                logger.warn(`🧠 Context: VectorMemory unavailable — proceeding with empty context. (${vectorError.message})`);
            }

            // 2. Retrieve Graph Context (Explicit Relationships)
            let graphContext = '';
            for (const [file, deps] of this.dependencyGraph.entries()) {
                if (userQuery.includes(path.basename(file))) {
                    graphContext += `\n[GRAPH] ${file} depends on: ${Array.from(deps).join(', ')}\n`;
                }
            }

            // 2.5 Retrieve Learned Lessons
            let learnedContext = '';
            for (const [category, insights] of this.lessons.entries()) {
                if (userQuery.toLowerCase().includes(category) || category === 'general') {
                    learnedContext += `\n[LESSONS - ${category.toUpperCase()}]\n- ${Array.from(insights).join('\n- ')}\n`;
                }
            }

            // 3. Construct Prompt
            const contextBlock = results.map((r, i) =>
                `[REFERENCE ${i + 1}] File: ${r.metadata?.filePath ?? 'unknown'}\nContent:\n${r.content}\n`
            ).join('\n---\n');

            let projectRules = '';
            try { projectRules = await fs.readFile('.altirules', 'utf-8'); } catch { /* optional file */ }

            const prompt = `
            You are the Cortex, the collective intelligence of this codebase.
            
            PROJECT RULES:
            ${projectRules}

            CONTEXT (Vector):
            ${contextBlock || 'No vector context available.'}

            CONTEXT (Graph):
            ${graphContext || 'No graph relationships found.'}

            CONTEXT (Lessons Learned):
            ${learnedContext || 'No lessons recorded yet.'}
            
            HISTORY:
            ${JSON.stringify(this.conversationHistory)}

            User Question: ${userQuery}
            
            Instructions:
            1. Answer the question using the provided context.
            2. Use the Graph context to explain dependencies if relevant.
            3. Be technical and precise.
            `;

            // 4. Generate Answer
            const answer = await GeminiAiService.generateContent(prompt);

            this.conversationHistory.push({ role: 'assistant', content: answer });
            if (this.conversationHistory.length > MAX_HISTORY) {
                this.conversationHistory = this.conversationHistory.slice(-MAX_HISTORY);
            }

            return {
                answer,
                references: results.map(r => r.metadata?.filePath ?? 'unknown'),
                graphInfo: graphContext ? 'Included' : 'None',
            };

        } catch (error) {
            logger.error('Context Service Query Error', error);
            return {
                answer: 'Sorry, I encountered an error while processing your request.',
                error: error.message,
            };
        }
    }
    /** Clear the conversation history (useful for testing or session resets). */
    clearHistory() {
        this.conversationHistory = [];
        logger.info('🧠 Context: Conversation history cleared.');
    }

    /** Return a copy of all learned lessons as a plain object. */
    getLessons() {
        const out = {};
        for (const [cat, set] of this.lessons.entries()) {
            out[cat] = [...set];
        }
        return out;
    }
}

export const contextService = new ContextService();

