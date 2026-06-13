/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Audit Log Service
 * Responsible for creating WORM-compliant cryptographic audit logs
 * for SOC 2 and FedRAMP compliance. Uses SHA-256 to chain log entries.
 */

import crypto from 'crypto';
import { prisma } from '../../../config/prisma.js';
import { logger } from '../../../shared/logger.js';

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
        const { tenantId, userId, userEmail, action, resource, ipAddress, userAgent, status, metadata = {} } = params;

        try {
            // Retrieve previous hash from the DB (simplification for single-tenant / scaling)
            const lastLog = await prisma.auditLog.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { hash: true }
            });
            const previousHash = lastLog?.hash || this.lastHash;

            // Generate cryptographic hash of this new log entry
            const payloadString = JSON.stringify({ tenantId, userId, action, resource, timestamp: Date.now(), previousHash });
            const currentHash = crypto.createHash('sha256').update(payloadString).digest('hex');

            const auditEntry = await prisma.auditLog.create({
                data: {
                    tenantId,
                    actor: userEmail || userId || 'system',
                    action,
                    ipAddress,
                    userAgent,
                    status,
                    metadata: {
                        ...metadata,
                        userId: userId || null,
                        resource: resource || 'system'
                    },
                    hash: currentHash,
                    previousHash,
                    environment: process.env.NODE_ENV || 'development'
                }
            });

            this.lastHash = currentHash;
            logger.info(`[AUDIT] Action: ${action} | Actor: ${auditEntry.actor} | Status: ${status}`);

            return auditEntry;
        } catch (error) {
            // We do NOT throw here usually, because we don't want to crash the main request 
            // if audit logging fails (though in strict IL6 environments, we might actually want to).
            logger.error(`[AUDIT] Failed to write to Immutable Ledger: ${error.message}`);
        }
    }
}

export const auditLogService = new AuditLogService();
