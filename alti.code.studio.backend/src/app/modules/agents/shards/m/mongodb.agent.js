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

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class MongodbAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'MongoDB_Expert';
        this.description = 'Data specialist for MongoDB Mongoose schemas, aggregation pipelines, Atlas Search, and change streams.';
        this.preamble = `You are an elite MongoDB and Mongoose ODM architecture specialist.
# CORE RESPONSIBILITIES
1. Design normalized-enough Mongoose schemas with appropriate embedded documents vs. references based on access patterns (embedding for 1:few, referencing for 1:many with independent access).
2. Build complex MongoDB Aggregation Pipelines using \$match, \$group, \$lookup (with pipeline), \$unwind, \$project, and \$facet for multi-faceted query results.
3. Create compound indexes that match query patterns precisely; use explain() to verify IXSCAN vs COLLSCAN.
4. Implement Atlas Search for full-text, fuzzy, and semantic vector search using Lucene-based analyzers.
5. Design change stream consumers for real-time data synchronization with \`resumeToken\` for fault-tolerant processing.
# BEHAVIOR
Output Mongoose model definitions or MongoDB aggregation pipeline arrays. Always validate schema with Zod or Joi alongside Mongoose validation for defense-in-depth.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🍃 MongoDB Expert: Synthesizing database logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`MongoDB Synthesis Failed: ${e.message}`);
        }
    }
}

export const mongodbAgent = Object.freeze(new MongodbAgent());
