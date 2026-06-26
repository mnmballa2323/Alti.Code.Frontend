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
import { Langfuse } from 'langfuse';

export class SwarmTraceService {
  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/postgres',
    });
    this.activeSpans = new Map();
    this.activeLangfuseObjects = new Map();

    this.langfuse = null;
    if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
      this.langfuse = new Langfuse({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
      });
      logger.info('📊 SwarmTrace: Langfuse telemetry client initialized.');
    }

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
        [spanId, parentSpanId || null, agentId, tenantId || null, query || ''],
      );
    } catch (error) {
      logger.error(
        `SwarmTrace: Failed to insert startSpan for ${agentId}`,
        error,
      );
    }

    // Langfuse tracing
    if (this.langfuse) {
      try {
        if (!parentSpanId) {
          // Start a new Trace
          const traceObj = this.langfuse.trace({
            id: spanId,
            name: agentId,
            userId: tenantId || undefined,
            input: query || undefined,
          });
          this.activeLangfuseObjects.set(spanId, traceObj);
        } else {
          // Start a child Span nested under parentSpanId
          const spanObj = this.langfuse.span({
            id: spanId,
            traceId: parentSpanId,
            parentSpanId: parentSpanId,
            name: agentId,
            input: query || undefined,
          });
          this.activeLangfuseObjects.set(spanId, spanObj);
        }
      } catch (lfError) {
        logger.warn(
          `SwarmTrace: Langfuse startSpan failed: ${lfError.message}`,
        );
      }
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
        [
          durationMs,
          tokenCount || 0,
          cost || 0,
          JSON.stringify(metadata || {}),
          spanId,
        ],
      );
    } catch (error) {
      logger.error(`SwarmTrace: Failed to update endSpan for ${spanId}`, error);
    }

    // Langfuse tracing end
    if (this.langfuse) {
      try {
        const langfuseObj = this.activeLangfuseObjects.get(spanId);
        if (langfuseObj) {
          const outputVal = metadata.output || metadata.content || '';

          if (typeof langfuseObj.update === 'function') {
            // It's a Trace
            langfuseObj.update({
              output: outputVal,
              metadata: {
                ...metadata,
                tokenCount: tokenCount || 0,
                cost: cost || 0,
                durationMs,
              },
            });
          } else if (typeof langfuseObj.end === 'function') {
            // It's a Span
            langfuseObj.end({
              output: outputVal,
              metadata: {
                ...metadata,
                tokenCount: tokenCount || 0,
                cost: cost || 0,
                durationMs,
              },
            });
          }
          this.activeLangfuseObjects.delete(spanId);
        }
      } catch (lfError) {
        logger.warn(`SwarmTrace: Langfuse endSpan failed: ${lfError.message}`);
      }
    }
  }

  recordGeneration(
    spanId,
    { name, model, input, output, provider, latencyMs, usage },
  ) {
    if (!this.langfuse) return;
    try {
      const parentObj = this.activeLangfuseObjects.get(spanId);
      if (parentObj && typeof parentObj.generation === 'function') {
        parentObj.generation({
          name: name || 'llm_call',
          model: model,
          input: input,
          output: output,
          metadata: { provider, latencyMs },
          usage: usage
            ? {
                promptTokens: usage.prompt || usage.promptTokens,
                completionTokens: usage.completion || usage.completionTokens,
              }
            : undefined,
        });
      }
    } catch (lfError) {
      logger.warn(
        `SwarmTrace: Langfuse recordGeneration failed: ${lfError.message}`,
      );
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
