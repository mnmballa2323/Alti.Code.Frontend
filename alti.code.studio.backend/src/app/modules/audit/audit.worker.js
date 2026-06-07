/**
 * Copyright (c) 2024 Inso Code
 * 
 * Audit Worker — "The Black Box"
 * Cryptographically signs every system action via LedgerService.
 * Every entry is linked to the previous via SHA-256 hash chain.
 */

import { ledgerService } from '../ledger/ledger.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * AuditWorker Processor
 * Job data: { actor, action, metadata, status, environment, ipAddress, userAgent }
 */
export const auditWorkerProcessor = async (job) => {
    const jobId = job.id;

    logger.info(`🔐 AuditWorker [${jobId}]: Recording to Ledger...`);

    try {
        const log = await ledgerService.record(job.data);
        logger.info(`✅ AuditWorker [${jobId}]: Sealed. Hash: ${log.hash.substring(0, 12)}...`);
        return { hash: log.hash, previousHash: log.previousHash };
    } catch (error) {
        logger.error(`❌ AuditWorker [${jobId}] Failed: ${error.message}`);
        throw error;
    }
};
