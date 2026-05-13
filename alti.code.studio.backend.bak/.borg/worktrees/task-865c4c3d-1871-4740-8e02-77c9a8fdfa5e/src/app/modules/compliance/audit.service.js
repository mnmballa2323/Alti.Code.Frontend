/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';

class AuditService {
    constructor() {
        this.auditLogPath = path.join(process.cwd(), 'audit_logs.jsonl');
        // Ensure file exists
        if (!fs.existsSync(this.auditLogPath)) {
            fs.writeFileSync(this.auditLogPath, '');
        }
    }

    /**
     * Log a compliance event.
     * @param {string} actorId - User ID or Agent ID performing the action
     * @param {string} action - The action being performed (e.g., 'READ_FILE', 'EXECUTE_CODE')
     * @param {string} resource - The resource being accessed
     * @param {string} outcome - 'SUCCESS', 'DENIED', 'FAILURE'
     * @param {object} metadata - Additional context
     */
    async log(actorId, action, resource, outcome, metadata = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            actorId,
            action,
            resource,
            outcome,
            metadata,
            traceId: metadata.traceId || 'N/A'
        };

        const line = JSON.stringify(entry) + '\n';

        try {
            await fs.promises.appendFile(this.auditLogPath, line);
            // In a real Fortune 100 app, this would stream to Splunk/Datadog/CloudWatch
            logger.info(`🛡️ [AUDIT] ${action} by ${actorId}: ${outcome}`);
        } catch (error) {
            logger.error(`❌ [AUDIT FAILURE] Could not write to audit log: ${error.message}`);
        }
    }

    async getLogs(limit = 100) {
        try {
            const content = await fs.promises.readFile(this.auditLogPath, 'utf8');
            const lines = content.trim().split('\n');
            return lines.slice(-limit).map(line => {
                try { return JSON.parse(line); } catch (e) { return null; }
            }).filter(Boolean).reverse();
        } catch (error) {
            return [];
        }
    }
}

export const auditService = new AuditService();
