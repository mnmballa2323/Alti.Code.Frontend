/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * Ledger Verifier Service
 * Cryptographically verifies the SHA-256 blockchain ledger in PostgreSQL.
 */

import crypto from 'crypto';
import { prisma } from '../../../config/prisma.js';
import { logger } from '../../../shared/logger.js';

class LedgerVerifierService {
  /**
   * Scans and verifies the cryptographic integrity of the audit logs.
   * Detects insertions, modifications, or deletions in the hash chain.
   *
   * @param {string} [tenantId] Optional tenantId filter
   * @returns {Promise<object>} Verification report
   */
  async verifyChain(tenantId) {
    logger.info(`🔍 [LedgerVerifier] Starting cryptographic verification of WORM ledger...`);

    const queryOptions = {
      orderBy: { createdAt: 'asc' },
    };

    if (tenantId) {
      queryOptions.where = { tenantId };
    }

    const logs = await prisma.auditLog.findMany(queryOptions);

    if (logs.length === 0) {
      return { success: true, verifiedCount: 0, status: 'EMPTY_LEDGER' };
    }

    let expectedPreviousHash = crypto.createHash('sha256').update('genesis').digest('hex');

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      // 1. Verify previous hash link matches calculated preceding hash
      if (log.previousHash !== expectedPreviousHash) {
        logger.error(`❌ [LedgerVerifier] TAMPER DETECTED: Chain broken at block ID: ${log.id}. previousHash mismatch.`);
        return {
          success: false,
          tamperedIndex: i,
          tamperedRecordId: log.id,
          reason: 'CHAIN_BREAK',
          detail: `Block expects previousHash '${log.previousHash}' but recalculation got '${expectedPreviousHash}'.`,
        };
      }

      // 2. Reconstruct payload to re-verify original signature
      const payloadString = JSON.stringify({
        tenantId: log.tenantId || undefined,
        productId: log.productId || undefined,
        userId: log.metadata?.userId || null,
        action: log.action,
        resource: log.metadata?.resource || 'system',
        timestamp: log.createdAt.getTime(),
        previousHash: log.previousHash,
      });

      const calculatedHash = crypto
        .createHash('sha256')
        .update(payloadString)
        .digest('hex');

      // 3. Compare stored hash against computed payload hash
      if (calculatedHash !== log.hash) {
        logger.error(`❌ [LedgerVerifier] TAMPER DETECTED: Payload altered at block ID: ${log.id}.`);
        return {
          success: false,
          tamperedIndex: i,
          tamperedRecordId: log.id,
          reason: 'RECORD_MODIFICATION',
          detail: `Stored hash '${log.hash}' does not match calculated hash '${calculatedHash}'.`,
        };
      }

      expectedPreviousHash = calculatedHash;
    }

    logger.info(`✅ [LedgerVerifier] Ledger integrity verified. All ${logs.length} blocks checked.`);
    return {
      success: true,
      verifiedCount: logs.length,
      status: 'VERIFIED',
    };
  }
}

export const ledgerVerifierService = new LedgerVerifierService();
