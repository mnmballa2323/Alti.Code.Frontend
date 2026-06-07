/**
 * Copyright (c) 2024 Inso Code
 * 
 * The Visionary — Product Owner Agent
 * Responsible for high-level decision making, feature prioritization, and 
 * converting vague requirements into structured user stories.
 */
import fs from 'fs';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';
import { contextService } from '../cortex/context.service.js';

class ProductOwnerAgent {
    constructor() {
        this.visionPath = path.resolve(process.cwd(), '../docs/VISION.md'); // Adjust path as needed
        this.roadmapPath = path.resolve(process.cwd(), '../ROADMAP.md');
    }

    async _loadContext() {
        try {
            const vision = fs.existsSync(this.visionPath) ? fs.readFileSync(this.visionPath, 'utf-8') : 'Vision not found.';
            const roadmap = fs.existsSync(this.roadmapPath) ? fs.readFileSync(this.roadmapPath, 'utf-8') : 'Roadmap not found.';
            return { vision, roadmap };
        } catch (error) {
            logger.warn(`PO Agent failed to load context: ${error.message}`);
            return { vision: '', roadmap: '' };
        }
    }

    /**
     * Analyze a high-level request and break it down
     * @param {string} request 
     */
    async analyzeRequest(request) {
        const context = await this._loadContext();

        // Enhance context with Codebase RAG
        let codeContext = "";
        try {
            const ragResult = await contextService.query(request, { limit: 3 });
            codeContext = ragResult.answer + "\n\nReferences:\n" + ragResult.references.join('\n');
            logger.info("PO Agent: Retrieved context from Cortex.");
        } catch (err) {
            logger.warn("PO Agent: Failed to retrieve Cortex context", err);
            codeContext = "No codebase context available.";
        }

        const prompt = `
        You are "The Visionary", the Product Owner of this software project.
        
        PROJECT VISION:
        ${context.vision}

        CURRENT ROADMAP:
        ${context.roadmap}

        EXISTING CODEBASE CONTEXT (from Cortex):
        ${codeContext}

        USER REQUEST:
        "${request}"

        YOUR TASK:
        Analyze this request. 
        1. Does it align with the vision?
        2. Where does it fit in the roadmap?
        3. Break it down into 3-5 high-level features.
        4. CHECK FOR DUPLICATES: Based on the "Existing Codebase Context", does this feature already exist?
        
        Respond in JSON format:
        {
            "alignment_score": number (0-10),
            "alignment_reasoning": "string",
            "is_duplicate": boolean,
            "suggested_features": [
                { "name": "string", "description": "string", "priority": "High/Medium/Low" }
            ]
        }
        `;

        try {
            // Using 'reason' mode for analytical thinking
            const response = await aiProvider.reason(prompt);
            // Attempt to parse JSON from potential markdown wrapping
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { raw: response };
        } catch (error) {
            logger.error(`Product Owner Analysis Failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate User Stories for a specific feature
     * @param {string} featureName 
     * @param {string} featureDescription 
     */
    async generateUserStories(featureName, featureDescription) {
        const prompt = `
        As the Product Owner, create detailed User Stories for the following feature:
        
        Feature: ${featureName}
        Description: ${featureDescription}

        Output format: JSON Array of objects
        [
            {
                "title": "As a <role>, I want <goal>, so that <benefit>",
                "acceptance_criteria": [
                    "Criteria 1", "Criteria 2"
                ],
                "estimation_points": number (Fibonacci)
            }
        ]
        `;

        try {
            // Using 'generate' mode for creative writing
            const response = await aiProvider.generate(prompt);
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { raw: response };
        } catch (error) {
            logger.error(`Product Owner Story Gen Failed: ${error.message}`);
            throw error;
        }
    }
}

export const productOwnerAgent = new ProductOwnerAgent();
