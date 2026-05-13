/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { Logging } from '@google-cloud/logging';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

class AuditService {
    constructor() {
        this.projectId = config.gcp.project_id;
        this.logName = 'alti-code-studio-audit';
        this.isCloudEnabled = false;

        // Initialize Google Cloud Logging
        if (this.projectId) {
            try {
                this.logging = new Logging({ projectId: this.projectId });
                this.log = this.logging.log(this.logName);
                this.isCloudEnabled = true;
                logger.info('✅ AuditService: Connected to Google Cloud Logging');
            } catch (error) {
                this.isCloudEnabled = false;
                logger.warn('⚠️ AuditService: Google Cloud Init Failed (Soft Fail). Using local logs only.');
            }
        } else {
            logger.warn('⚠️ AuditService: No GCP Project ID. Google Cloud Logging disabled.');
        }
    }

    /**

import { Logging } from '@google-cloud/logging';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

class AuditService {
    constructor() {
        this.projectId = config.gcp.project_id;
        this.logName = 'alti-code-studio-audit';
        this.isCloudEnabled = false;

        // Initialize Google Cloud Logging
        if (this.projectId) {
            try {
                this.logging = new Logging({ projectId: this.projectId });
                this.log = this.logging.log(this.logName);
                this.isCloudEnabled = true;
                logger.info('✅ AuditService: Connected to Google Cloud Logging');
            } catch (error) {
                this.isCloudEnabled = false;
                logger.warn('⚠️ AuditService: Google Cloud Init Failed (Soft Fail). Using local logs only.');
            }
        } else {
            logger.warn('⚠️ AuditService: No GCP Project ID. Google Cloud Logging disabled.');
        }
    }

    /**
     * Log an action to the immutable audit log.
     * @param {string} actor - User ID or Agent Name (e.g., 'user_123', 'RefactorAgent')
     * @param {string} action - Action performed (e.g., 'generate_code', 'write_file')
     * @param {object} metadata - Details about the action (target file, diff, etc.)
     * @param {string} status - 'SUCCESS' | 'FAILURE' | 'DENIED'
     */
    async logAction(actor, action, metadata, status = 'SUCCESS', req = null) {
        const entry = {
            timestamp: new Date(),
            actor,
            action,
            metadata: JSON.stringify(metadata), // Ensure flat structure for querying
            status,
            environment: config.env,
            ipAddress: req?.ip || 'internal',
            userAgent: req?.headers?.['user-agent'] || 'system'
        };

        // 1. Always log to local Winston logger for debugging
        logger.info(`AUDIT [${status}]: ${actor} performed ${action}`, entry);

        // 2. Push to Queue for Async Persistence (Hyper-Scale)
        try {
            const { queueService } = await import('../queue/queue.service.js');
            const job = await queueService.addJob('audit', entry);

            if (!job) {
                throw new Error('QueueService returned null');
            }
        } catch (queueError) {
            logger.warn('⚠️ AuditService: Queue failed, falling back to direct DB write', queueError.message);
            try {
                const { AuditLog } = await import('./audit.model.js');
                await AuditLog.create(entry);
            } catch (dbError) {
                logger.error('❌ AuditService: Failed to write to MongoDB (Fallback)', dbError);
            }
        }

        // 3. Push to Google Cloud Logging (The "Immutable" Ledger)
        if (this.isCloudEnabled) {
            try {
                const googleLogEntry = this.log.entry(
                    { resource: { type: 'global' } },
                    entry
                );
                await this.log.write(googleLogEntry);
            } catch (error) {
                logger.error('❌ AuditService: Failed to write to Google Cloud', error);
            }
        }
    }
}

export const auditService = new AuditService();
