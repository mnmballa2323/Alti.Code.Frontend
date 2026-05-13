/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * BATCH PROCESSOR — Bulk Agent Dispatch Engine
 * 
 * S&P 500 repos have 10,000+ files. This module handles:
 *   - Bulk file scanning (dispatch agent per file/chunk)
 *   - Parallel batch execution with configurable concurrency
 *   - Progress tracking and partial result collection
 *   - Batch-level cost attribution
 * 
 * Production: GKE horizontal autoscaling per batch
 */

import { logger } from '../../../shared/logger.js';
import { eventBus, EVENT_TYPES } from './event.bus.js';

class BatchProcessor {
    constructor() {
        /** @type {Map<string, object>} batchId → batch state */
        this.batches = new Map();
    }

    /**
     * Create and execute a batch
     * @param {object} params
     * @param {string} params.agentName - Agent to dispatch for each item
     * @param {object[]} params.items - Array of input items
     * @param {number} params.concurrency - Max parallel executions (default: 10)
     * @param {string} params.tenantId - Owning tenant
     * @param {Function} params.processorFn - (item) => Promise<result>
     * @returns {object} Batch status
     */
    async execute(params) {
        const { agentName, items, concurrency = 10, tenantId = 'default', processorFn } = params;

        const batchId = `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const batch = {
            id: batchId,
            agentName,
            tenantId,
            totalItems: items.length,
            completed: 0,
            failed: 0,
            results: [],
            errors: [],
            status: 'running',
            startedAt: new Date().toISOString(),
            completedAt: null,
        };

        this.batches.set(batchId, batch);
        logger.info(`📦 Batch [${batchId}]: ${items.length} items → ${agentName} (concurrency: ${concurrency})`);

        await eventBus.publish(EVENT_TYPES.WORKFLOW_STARTED, {
            batchId, agentName, totalItems: items.length,
        }, { tenantId });

        // Process in chunks for controlled concurrency
        for (let i = 0; i < items.length; i += concurrency) {
            const chunk = items.slice(i, i + concurrency);

            const chunkResults = await Promise.allSettled(
                chunk.map(async (item, idx) => {
                    try {
                        const result = await processorFn(item);
                        batch.completed++;
                        return { index: i + idx, status: 'ok', result };
                    } catch (err) {
                        batch.failed++;
                        return { index: i + idx, status: 'error', error: err.message };
                    }
                })
            );

            for (const r of chunkResults) {
                if (r.status === 'fulfilled') {
                    if (r.value.status === 'ok') batch.results.push(r.value);
                    else batch.errors.push(r.value);
                }
            }

            // Progress log
            const progress = Math.round(((batch.completed + batch.failed) / batch.totalItems) * 100);
            logger.info(`📦 Batch [${batchId}]: ${progress}% (${batch.completed} ok, ${batch.failed} failed)`);
        }

        batch.status = batch.failed === 0 ? 'completed' : 'completed_with_errors';
        batch.completedAt = new Date().toISOString();

        await eventBus.publish(EVENT_TYPES.WORKFLOW_COMPLETED, {
            batchId, agentName, completed: batch.completed, failed: batch.failed,
        }, { tenantId });

        return batch;
    }

    /** Get batch status */
    getStatus(batchId) {
        return this.batches.get(batchId) || null;
    }

    /** List all batches for a tenant */
    listBatches(tenantId) {
        return Array.from(this.batches.values())
            .filter(b => b.tenantId === tenantId)
            .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    }
}

export const batchProcessor = new BatchProcessor();
