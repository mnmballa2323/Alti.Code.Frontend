/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 2: DATA & INFRASTRUCTURE
 * 
 * Migration Agent — "The Shapeshifter"
 * Database/API migration planning and execution.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const migrationWorkerProcessor = async (job) => {
    const { fromSchema, toSchema, dbType } = job.data;
    logger.info(`🔄 Migration [${job.id}]: Planning migration for ${dbType || 'database'}...`);

    const plan = await aiProvider.generate(`
You are a database migration expert. Plan a safe, zero-downtime migration.

Database Type: ${dbType || 'PostgreSQL'}
From Schema: ${fromSchema || 'Not provided'}
To Schema: ${toSchema || 'Not provided'}

Generate:
1. **Migration Steps** — Ordered, reversible steps
2. **Rollback Plan** — How to undo each step
3. **Risk Assessment** — What could go wrong
4. **SQL** — Actual migration SQL
5. **Estimated Downtime** — Expected impact

Respond in JSON: { "steps": [], "rollback": [], "risks": [], "sql": string, "downtime": string }
    `);

    return { migration: JSON.parse(plan.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
