/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * Audit Log Service
 * Responsible for creating WORM-compliant cryptographic audit logs
 * for SOC 2 and FedRAMP compliance. Uses SHA-256 to chain log entries.
 */

import crypto from 'crypto';
import kms from '@google-cloud/kms';
import { prisma } from '../../../config/prisma.js';
import { logger } from '../../../shared/logger.js';

let kmsClient = null;

// Cryptographically sign a hash using Google Cloud KMS or local HMAC fallback
const signHash = async (hash) => {
  const keyName = process.env.GCP_KMS_KEY_NAME;
  
  if (!keyName) {
    // Secure local HMAC signature fallback for development / air-gapped compliance
    const secret = process.env.LOCAL_KMS_SECRET || 'inso-secret-kms-hmac-key';
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(hash).digest('hex');
    return { signature, keyId: 'local-hmac-sha256' };
  }

  try {
    if (!kmsClient) {
      const { KeyManagementServiceClient } = kms;
      kmsClient = new KeyManagementServiceClient();
    }

    const [response] = await kmsClient.asymmetricSign({
      name: keyName,
      digest: {
        sha256: Buffer.from(hash, 'hex'),
      },
    });

    return {
      signature: response.signature.toString('base64'),
      keyId: keyName,
    };
  } catch (error) {
    logger.warn(`⚠️ [AUDIT] GCP KMS sign failed, falling back to secure local signature: ${error.message}`);
    const secret = process.env.LOCAL_KMS_SECRET || 'inso-secret-kms-hmac-key';
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(hash).digest('hex');
    return { signature, keyId: `${keyName} (failed: local-fallback)` };
  }
};

class AuditLogService {
  constructor() {
    // Keeps track of the last hash in memory to build a blockchain-like tamper-evident log
    // In a real multi-node environment, we would use Redis or the DB for `previousHash`.
    this.lastHash = crypto.createHash('sha256').update('genesis').digest('hex');
  }

  /**
   * Log an action to the Immutable Audit Ledger
   */
  async logAction(params) {
    const {
      tenantId,
      productId,
      userId,
      userEmail,
      action,
      resource,
      ipAddress,
      userAgent,
      status,
      metadata = {},
    } = params;

    try {
      // Retrieve previous hash from the DB (simplification for single-tenant / scaling)
      const lastLog = await prisma.auditLog.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { hash: true },
      });
      const previousHash = lastLog?.hash || this.lastHash;

      // Generate cryptographic hash of this new log entry (scoped to productId)
      const payloadString = JSON.stringify({
        tenantId,
        productId,
        userId,
        action,
        resource,
        timestamp: Date.now(),
        previousHash,
      });
      const currentHash = crypto
        .createHash('sha256')
        .update(payloadString)
        .digest('hex');

      // Sign the hash cryptographically for WORM verification
      const { signature, keyId } = await signHash(currentHash);

      const auditEntry = await prisma.auditLog.create({
        data: {
          tenantId,
          productId,
          actor: userEmail || userId || 'system',
          action,
          ipAddress,
          userAgent,
          status,
          metadata: {
            ...metadata,
            userId: userId || null,
            resource: resource || 'system',
          },
          hash: currentHash,
          previousHash,
          kmsSignature: signature,
          kmsKeyId: keyId,
          environment: process.env.NODE_ENV || 'development',
        },
      });

      this.lastHash = currentHash;
      logger.info(
        `[AUDIT] Action: ${action} | Actor: ${auditEntry.actor} | Status: ${status}`,
      );

      // Dispatch audit event to all active SIEM endpoints
      try {
        const { siemService } = await import('./siem.service.js');
        siemService
          .dispatchEvent(tenantId, 'AUDIT_LOG_ENTRY', auditEntry)
          .catch(() => {});
      } catch (siemErr) {
        logger.debug(`[AUDIT] SIEM dispatch skipped: ${siemErr.message}`);
      }

      return auditEntry;
    } catch (error) {
      // We do NOT throw here usually, because we don't want to crash the main request
      // if audit logging fails (though in strict IL6 environments, we might actually want to).
      logger.error(
        `[AUDIT] Failed to write to Immutable Ledger: ${error.message}`,
      );
    }
  }
}

export const auditLogService = new AuditLogService();
