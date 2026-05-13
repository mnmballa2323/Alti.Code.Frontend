import { logger } from '../../utils/logger.js';

/**
 * Phase 11.0.0: The Zero-Downtime Migration & Data Resilience Engine
 * Backfill Orchestrator Service
 * 
 * Safely executes asynchronous, throttled data mutations on live production tables
 * to prevent Out-Of-Memory (OOM) kills, CPU spikes, or excessive database locks
 * during the "Expand and Contract" migration pattern.
 */
class BackfillOrchestrator {
    constructor() {
        this.activeJobs = new Map();
        // Sane defaults for production execution
        this.DEFAULT_BATCH_SIZE = 1000;
        this.DEFAULT_THROTTLE_MS = 50;
        logger.info('🗄️ BackfillOrchestrator initialized. Ready for batched data mutations.');
    }

    /**
     * Start a new resilient background backfill task.
     * 
     * @param {string} jobId Unique identifier for the transaction.
     * @param {Function} fetchBatchFn Async function returning an array of raw rows.
     * @param {Function} processBatchFn Async function containing the transformation logic.
     * @param {Object} options Configuration overrides (batchSize, throttleMs).
     */
    async startBackfill(jobId, fetchBatchFn, processBatchFn, options = {}) {
        if (this.activeJobs.has(jobId)) {
            throw new Error(`Backfill job ${jobId} is already running.`);
        }

        const config = {
            batchSize: options.batchSize || this.DEFAULT_BATCH_SIZE,
            throttleMs: options.throttleMs || this.DEFAULT_THROTTLE_MS,
            cursor: null,
            rowsProcessed: 0,
            status: 'running',
            errors: 0
        };

        this.activeJobs.set(jobId, config);
        logger.info(`🗄️ [${jobId}] Starting backfill. Batch size: ${config.batchSize}, Throttle: ${config.throttleMs}ms`);

        // Fire-and-forget background execution
        this._executeLoop(jobId, fetchBatchFn, processBatchFn)
            .catch(err => logger.error(`🗄️ [${jobId}] Critical backfill failure: ${err.message}`));

        return { jobId, status: 'initiated' };
    }

    async _executeLoop(jobId, fetchBatchFn, processBatchFn) {
        const config = this.activeJobs.get(jobId);

        try {
            while (config.status === 'running') {
                // 1. Fetch
                const rows = await fetchBatchFn(config.batchSize, config.cursor);
                if (!rows || rows.length === 0) {
                    config.status = 'completed';
                    logger.info(`🗄️ [${jobId}] Backfill completed. Processed ${config.rowsProcessed} rows total.`);
                    break;
                }

                // 2. Process
                try {
                    await processBatchFn(rows);
                    config.rowsProcessed += rows.length;
                    // Update cursor to the ID of the last processed row for the next pagination fetch
                    config.cursor = rows[rows.length - 1].id;
                } catch (batchErr) {
                    config.errors++;
                    logger.warn(`🗄️ [${jobId}] Batch processing error. Count: ${config.errors}. Error: ${batchErr.message}`);
                    if (config.errors > 10) {
                        throw new Error('Exceeded maximum error threshold. Aborting backfill loop.');
                    }
                }

                // 3. Throttle (Let the event loop breathe, avoid saturating DB connections)
                await new Promise(resolve => setTimeout(resolve, config.throttleMs));
            }
        } catch (fatalError) {
            config.status = 'failed';
            logger.error(`🗄️ [${jobId}] FAILED. Rows Processed: ${config.rowsProcessed}. Error: ${fatalError.message}`);
        } finally {
            // Keep job in map for a while to allow status checking, but mark inactive
            setTimeout(() => this.activeJobs.delete(jobId), 1000 * 60 * 60 * 24); // clear after 24h
        }
    }

    getJobStatus(jobId) {
        return this.activeJobs.get(jobId) || { status: 'not_found' };
    }
}

export const backfillOrchestrator = new BackfillOrchestrator();
