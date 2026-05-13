/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { VertexAI } from '@google-cloud/vertexai';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

class CompletionService {
    constructor() {
        this.project = config.gcp.project_id;
        this.location = config.gcp.location;
        this.modelName = 'gemini-3.1-pro'; // Used for high-quality code completion

        this.vertexAI = null;
        this.generativeModel = null;
        this.isMockMode = false;

        this.init();
    }

    init() {
        try {
            if (!this.project || this.project === 'none' || this.project === 'your-gcp-project-id') {
                throw new Error("GCP credentials not configured. Skipping Vertex AI initialization.");
            }

            this.vertexAI = new VertexAI({
                project: this.project,
                location: this.location
            });

            this.generativeModel = this.vertexAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    'maxOutputTokens': 100, // Short completion
                    'temperature': 0.2,
                }
            });
        } catch (error) {
            logger.warn('CompletionService: Init failed, using Mock Mode.');
            this.isMockMode = true;
        }
    }

    /**
     * Ghost Text Completion
     * @param {string} prefix - Code before cursor
     * @param {string} suffix - Code after cursor
     */
    async complete(prefix, suffix) {
        if (prefix === undefined || prefix === null) {
            prefix = '';
        }
        if (this.isMockMode || !this.generativeModel) {
            return this.mockComplete(prefix);
        }

        const prompt = `
        Complete the code.
        PREFIX:
        ${prefix.slice(-500)}
        
        SUFFIX:
        ${suffix.slice(0, 500)}
        
        Return ONLY the missing code.
        `;

        try {
            // Race with 3s timeout
            const result = await Promise.race([
                this.generativeModel.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }]
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);

            return result.response.candidates[0].content.parts[0].text;
        } catch (error) {
            logger.warn('CompletionService: API failed or timed out', error);
            return this.mockComplete(prefix);
        }
    }

    mockComplete(prefix) {
        // Simple heuristic mock
        if (prefix.trim().endsWith('function')) {
            return ' myNewFunction() {\n    logger.info("Hello World");\n}';
        }
        if (prefix.trim().endsWith('console.')) {
            return 'log("Debug");';
        }
        return ' // Suggested Code';
    }
}

export const completionService = new CompletionService();
