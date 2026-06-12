/**
 * Copyright (c) 2026 Inso Code
 *
 * Swarm Tracing & Observability Service
 * Captured trace metrics for all agent-to-agent DAG hops.
 */

import pg from 'pg';
const { Pool } = pg;
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

class SwarmTraceService {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
        });
        this.activeSpans = new Map();
        this.init();
    }

    async init() {
        try {
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS swarm_traces (
                    id text PRIMARY KEY,
                    parent_id text,
                    agent_id text,
                    tenant_id text,
                    query text,
                    duration_ms integer,
                    token_count integer,
                    cost numeric,
                    metadata jsonb,
                    created_at timestamp with time zone default now()
                )
            `);
            logger.info('📊 SwarmTrace: swarm_traces database table initialized.');
        } catch (error) {
            logger.error('❌ SwarmTrace init failed. Is PostgreSQL running?', error);
        }
    }

    async startSpan(agentId, parentSpanId, tenantId, query = '') {
        const spanId = `span_${crypto.randomUUID()}`;
        this.activeSpans.set(spanId, Date.now());

        try {
            await this.pool.query(
                'INSERT INTO swarm_traces (id, parent_id, agent_id, tenant_id, query, duration_ms, token_count, cost) VALUES ($1, $2, $3, $4, $5, 0, 0, 0)',
                [spanId, parentSpanId || null, agentId, tenantId || null, query || '']
            );
        } catch (error) {
            logger.error(`SwarmTrace: Failed to insert startSpan for ${agentId}`, error);
        }

        return spanId;
    }

    async endSpan(spanId, tokenCount, cost, metadata = {}) {
        const startTime = this.activeSpans.get(spanId);
        let durationMs = 0;
        if (startTime) {
            durationMs = Date.now() - startTime;
            this.activeSpans.delete(spanId);
        }

        try {
            await this.pool.query(
                'UPDATE swarm_traces SET duration_ms = $1, token_count = $2, cost = $3, metadata = $4 WHERE id = $5',
                [durationMs, tokenCount || 0, cost || 0, JSON.stringify(metadata || {}), spanId]
            );
        } catch (error) {
            logger.error(`SwarmTrace: Failed to update endSpan for ${spanId}`, error);
        }
    }

    /** Helper for tests to clean up traces */
    async reset() {
        try {
            await this.pool.query('DELETE FROM swarm_traces');
        } catch (error) {
            logger.error('SwarmTrace: reset failed', error);
        }
    }
}

export const swarmTraceService = new SwarmTraceService();
