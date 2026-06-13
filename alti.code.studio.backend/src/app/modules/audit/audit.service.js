/**
 * Copyright (c) 2026 Inso Code
 * 
 * Immutable Cryptographic Audit Service (WORM)
 * 
 * Enforces SOC2, ISO27001, and SOX compliance by logging all AI and system 
 * actions into a cryptographically-linked blockchain structure inside Postgres.
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const canonicalize = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(canonicalize);
    }
    const sortedKeys = Object.keys(obj).sort();
    const result = {};
    for (const key of sortedKeys) {
        result[key] = canonicalize(obj[key]);
    }
    return result;
};

export class AuditService {
    /**
     * Hashes an audit log payload securely.
     */
    static _hashPayload(payload, previousHash) {
        const canonicalPayload = canonicalize(payload);
        const str = JSON.stringify(canonicalPayload) + previousHash;
        return crypto.createHash('sha256').update(str).digest('hex');
    }

    /**
     * Logs an immutable action into the database.
     * @param {Object} data 
     * @param {string} data.tenantId
     * @param {string} data.actor (User ID or Agent Name)
     * @param {string} data.action
     * @param {Object} data.metadata
     * @param {string} data.status
     */
    static async log(data) {
        try {
            // Fetch the last hash sequentially
            const lastLog = await prisma.auditLog.findFirst({
                orderBy: { timestamp: 'desc' },
                select: { hash: true }
            });

            const previousHash = lastLog ? lastLog.hash : '0000000000000000000000000000000000000000000000000000000000000000';
            
            const payload = {
                tenantId: data.tenantId || null,
                actor: data.actor,
                action: data.action,
                metadata: data.metadata || {},
                status: data.status || 'SUCCESS'
            };
            if (data.productId !== undefined && data.productId !== null) {
                payload.productId = data.productId;
            }

            const hash = this._hashPayload(payload, previousHash);

            const newLog = await prisma.auditLog.create({
                data: {
                    tenantId: data.tenantId,
                    productId: data.productId,
                    actor: data.actor,
                    action: data.action,
                    metadata: data.metadata || {},
                    status: data.status || 'SUCCESS',
                    previousHash,
                    hash,
                }
            });

            // Stream to SIEM via TLS if configured
            if (process.env.SIEM_URL && process.env.SIEM_TOKEN) {
                try {
                    await fetch(process.env.SIEM_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Splunk ${process.env.SIEM_TOKEN}`
                        },
                        body: JSON.stringify({
                            time: Date.now(),
                            source: 'alti.code.studio.audit',
                            event: newLog
                        }),
                        // Abort early so we don't hold up execution
                        signal: AbortSignal.timeout(3000)
                    });
                } catch (siemError) {
                    console.error(`[WARNING] Failed to stream to SIEM: ${siemError.message}`);
                }
            }

            return newLog;
        } catch (error) {
            console.error(`[CRITICAL] Failed to append to immutable audit ledger: ${error.message}`);
        }
    }

    /**
     * Backward-compatibility/wrapper method matching the expected logAction schema
     */
    static async logAction(actor, action, metadata = {}, status = 'SUCCESS', tenantId = null, productId = null) {
        return this.log({ actor, action, metadata, status, tenantId, productId });
    }

    /**
     * Validates the cryptographic integrity of the entire audit chain.
     */
    static async verifyChainIntegrity() {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'asc' }
        });

        let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';

        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            if (log.previousHash !== previousHash) {
                return { valid: false, brokenAtId: log.id, reason: 'Previous hash mismatch' };
            }

            const payload = {
                tenantId: log.tenantId,
                actor: log.actor,
                action: log.action,
                metadata: log.metadata,
                status: log.status
            };
            if (log.productId !== undefined && log.productId !== null) {
                payload.productId = log.productId;
            }

            const computedHash = this._hashPayload(payload, previousHash);

            if (computedHash !== log.hash) {
                return { valid: false, brokenAtId: log.id, reason: 'Hash tampering detected' };
            }

            previousHash = log.hash;
        }

        return { valid: true };
    }
}

export const auditService = AuditService;

