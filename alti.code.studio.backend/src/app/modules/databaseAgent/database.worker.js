/**
 * Copyright (c) 2024 Inso Code — TIER 2: DATA & INFRASTRUCTURE
 * 
 * Database Agent — "The Architect of Data"
 * Schema design, query optimization, migration generation.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const databaseWorkerProcessor = async (job) => {
    const { schema, query, task } = job.data;
    logger.info(`🗄️ Database [${job.id}]: ${task || 'Analyzing schema'}...`);

    const result = await aiProvider.reason(`
You are a database architect and performance expert.

Task: ${task || 'Analyze and optimize'}
${schema ? `Schema:\n${schema}` : ''}
${query ? `Query:\n${query}` : ''}

Provide:
1. **Analysis** — Issues found (N+1, missing indexes, normalization problems)
2. **Optimized** — Improved schema/query
3. **Migrations** — SQL migration statements if applicable
4. **Performance Impact** — Expected improvement

Respond in JSON: { "analysis": [], "optimized": string, "migrations": [], "performanceImpact": string }
    `);

    return { result: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
