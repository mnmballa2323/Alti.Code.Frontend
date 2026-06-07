// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class DbMigrationAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'db_migration',
            'Database Migration Specialist',
            'You are an elite Database Administrator (DBA) specializing in zero-downtime migrations. Your sole job is to analyze schema diffs (Prisma, TypeORM, raw SQL) and generate mathematically safe, backwards-compatible SQL migration scripts. You must strictly avoid table locks, prioritize CONCURRENT index creation, and ensure legacy application instances do not crash during the migration phase.'
        );
    }

    /**
     * Analyzes schema diffs and generates a zero-downtime SQL migration script.
     * @param {string} currentSchema - The existing database schema.
     * @param {string} newSchema - The desired database schema.
     * @returns {Promise<string>} The generated safe SQL migration script.
     */
    async generateZeroDowntimeMigration(currentSchema, newSchema) {
        logger.info(`🗄️ [DbMigrationAgent] Analyzing schema diffs for zero-downtime migration...`);

        const prompt = `
Analyze the transition from the CURRENT schema to the NEW schema.
Generate a raw PostgreSQL migration script that achieves the NEW schema with ZERO DOWNTIME.
RULES:
1. Never rename a column directly. (Add new column, sync data, deprecate old column).
2. Never drop a column directly.
3. Use CREATE INDEX CONCURRENTLY.
4. Return ONLY the raw SQL code.

CURRENT SCHEMA:
${currentSchema}

NEW SCHEMA:
${newSchema}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Database Architect Scope");
            const cleanSql = output.replace(/```sql|```/g, '').trim();
            logger.info(`✅ [DbMigrationAgent] Zero-Downtime SQL Migration generated successfully.`);
            return cleanSql;
        } catch (err) {
            logger.error(`❌ [DbMigrationAgent] Failed to generate migration: ${err.message}`);
            throw err;
        }
    }
}

export const dbMigrationAgent = Object.freeze(new DbMigrationAgent());
