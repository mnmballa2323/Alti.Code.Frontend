/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class DatabaseAgent {
    constructor() {
        this.name = 'database';
        this.description = 'Autonomous Database Administrator (DBA)';
        this.capabilities = [
            'Analyze slow or unoptimized SQL/NoSQL queries',
            'Identify missing B-Tree indexes or sub-optimal join logic',
            'Synthesize formal SQL schema migrations to resolve bottlenecks'
        ];
    }

    /**
     * Scans a target query and current schema to recommend and generate indexing/migration scripts.
     * @param {string} targetQuery The underperforming SQL or ORM string
     * @param {string} currentSchema The current related database schema
     */
    async analyzeQuery(targetQuery, currentSchema = 'Unknown Schema') {
        logger.info(`🗄️ Database Agent: Initiating query plan analysis on DB Execution Engine...`);

        try {
            const prompt = `
            You are a Principal Database Administrator (DBA) specializing in PostgreSQL/MySQL optimization.
            Your task is to review the following slow query against the provided schema and determine if it is missing an index, doing a full table scan, or utilizing sub-optimal JOINs.
            
            Current Schema context: 
            \`\`\`sql
            ${currentSchema}
            \`\`\`

            Target Query:
            \`\`\`sql
            ${targetQuery}
            \`\`\`
            
            Return your complete analysis as a strict JSON object:
            {
                "isOptimized": boolean,
                "bottleneck": "Description of why the query is slow (e.g., 'Full table scan on users.email')",
                "suggestedMigration": "The exact SQL string to execute to fix this (e.g., 'CREATE INDEX idx_users_email ON users(email);')",
                "confidenceScore": number (0-100)
            }
            Do not enclose the JSON inside markdown ticks. Return raw JSON.
            `;

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const reportJson = rawResponse.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
            const dbaReport = JSON.parse(reportJson);

            if (!dbaReport.isOptimized) {
                logger.warn(`🐌 Database Agent Alert: Sub-optimal query detected. Confidence: ${dbaReport.confidenceScore}%`);
                logger.info(`   Bottleneck: ${dbaReport.bottleneck}`);
                logger.info(`   Proposed Migration: ${dbaReport.suggestedMigration}`);
            } else {
                logger.info(`✅ Database Agent: Query is executing nominally. No missing indexes detected.`);
            }

            return dbaReport;

        } catch (err) {
            logger.error(`❌ Database Agent Analysis Failed: ${err.message}`);
            throw err;
        }
    }

    async process(state) {
        const query = state.data?.content || state.goal || "";
        const schema = state.data?.context || "Generic SQL Table";

        const report = await this.analyzeQuery(query, schema);

        return {
            ...state,
            status: 'success',
            results: [...(state.results || []), `DBA Check: ${report.isOptimized ? 'OPTIMAL' : 'MIGRATION REQUIRED'}`]
        };
    }
}

export const databaseAgent = new DatabaseAgent();
