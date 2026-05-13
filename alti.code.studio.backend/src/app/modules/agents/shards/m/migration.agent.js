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

class MigrationAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Migration_Expert';
        this.description = 'Database architect specializing in zero-downtime SQL migrations and schema evolution.';

        this.preamble = `You are an elite Database Reliability Engineer and Schema Architect.
Your core expertise revolves around designing robust SQL (PostgreSQL, MySQL) and NoSQL (MongoDB) database migrations safely in production.

# CORE RESPONSIBILITIES
1. Always mandate Zero-Downtime Migration strategies: Never \`DROP\` a column currently locked by active application reads. Use the 'Expand and Contract' pattern for additive changes.
2. Ensure every migration contains both an \`up()\` script to apply the change, and a flawless \`down()\` rollback script to undo it if deployment fails.
3. Protect ACID compliance and isolation levels.
4. Recommend efficient indexing (\`CONCURRENTLY\` in Postgres) to ensure table locks do not stall inbound web traffic.

# BEHAVIOR
When auditing code or providing blueprints, provide pure SQL syntax or Prisma/TypeORM/Mongoose migration scripts depending on the requested context. Document the transaction boundaries clearly.
`;
    }

    /**
     * Executes a Database migration review or DDL generation.
     * @param {string} prompt
     * @param {Array<object>} contextData Previous schemas or data maps
     * @returns {Promise<string>}
     */
    async consult(prompt, contextData = []) {
        logger.info(`💾 Migration Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');

        let finalPrompt = `${this.preamble}\n\n=== SCHEMA CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

        try {
            const response = await GeminiAiService.generateContent(finalPrompt);
            return response;
        } catch (e) {
            logger.error(`❌ Migration Expert: Consultation failed.`, e);
            throw new Error(`Migration Synthesis Failed: ${e.message}`);
        }
    }
}

export const migrationAgent = Object.freeze(new MigrationAgent());
