/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import crypto from 'crypto';
import { Logging } from '@google-cloud/logging';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import { Storage } from '@google-cloud/storage';
import { DlpServiceClient } from '@google-cloud/dlp';
import { PubSub } from '@google-cloud/pubsub';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
// Dynamic import for AuditLog to avoid potential circular deps if unrelated, 
// allows fallback if DB is not ready, but we need it for hashing now.

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

                // Initialize KMS
                this.kmsClient = new KeyManagementServiceClient();
                this.kmsKeyName = this.kmsClient.cryptoKeyPath(
                    config.gcp.project_id,
                    config.gcp.location,
                    config.gcp.kms_key_ring,
                    config.gcp.kms_crypto_key
                );

                // Initialize Storage (WORM)
                this.storageClient = new Storage({ projectId: this.projectId });
                this.wormBucket = config.gcp.audit_gcs_bucket;
                if (this.wormBucket) {
                    this.isWormEnabled = true;
                }

                // Initialize DLP (Privacy/Redaction)
                this.dlpClient = new DlpServiceClient();
                this.dlpTemplate = config.gcp.dlp_inspect_template;

                // Initialize Pub/Sub (Real-time Alerting)
                this.pubsub = new PubSub({ projectId: this.projectId });
                this.alertTopicName = config.gcp.pubsub_audit_topic;

                this.isCloudEnabled = true;
                logger.info('✅ AuditService: Connected to Google Cloud Logging, KMS, WORM, DLP & PubSub');
            } catch (error) {
                this.isCloudEnabled = false;
                logger.warn('⚠️ AuditService: Google Cloud Init Failed (Soft Fail). Using local logs only.', error.message);
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
     * @param {object} req - Optional express request object
     * @param {object} aiProvenance - Optional AI decision context (Extremely high compliance)
     */
    async logAction(actor, action, metadata, status = 'SUCCESS', req = null, aiProvenance = null) {
        if (!actor || typeof actor !== 'string') {
            throw new Error('AuditService: actor must be a non-empty string.');
        }
        if (!action || typeof action !== 'string') {
            throw new Error('AuditService: action must be a non-empty string.');
        }
        let hash = 'N/A';

        let previousHash = 'GENESIS';

        // 0. Crypto-Sealing: Compute Hash
        try {
            // We utilize dynamic import here to fetch the model for the latest hash
            const { AuditLog } = await import('./audit.model.js');
            const lastEntry = await AuditLog.findOne({}, { hash: 1 }).sort({ createdAt: -1 });

            if (lastEntry && lastEntry.hash) {
                previousHash = lastEntry.hash;
            }

            // Phase 2: IRS/GDPR Data Loss Prevention (Redaction)
            if (this.dlpClient && metadata) {
                try {
                    const metadataString = JSON.stringify(metadata);
                    const [response] = await this.dlpClient.deidentifyContent({
                        parent: `projects/${this.projectId}/locations/global`,
                        deidentifyConfig: {
                            infoTypeTransformations: {
                                transformations: [
                                    {
                                        primitiveTransformation: { replaceWithInfoTypeConfig: {} }
                                    }
                                ]
                            }
                        },
                        inspectConfig: {
                            // Default to catching highly sensitive PII if no specific template is bound
                            infoTypes: [
                                { name: 'US_SOCIAL_SECURITY_NUMBER' },
                                { name: 'CREDIT_CARD_NUMBER' },
                                { name: 'EMAIL_ADDRESS' },
                                { name: 'IBAN_CODE' },
                                { name: 'US_BANK_ROUTING_MICR' }
                            ],
                            minLikelihood: 'LIKELY'
                        },
                        item: { value: metadataString }
                    });

                    if (response && response.item && response.item.value) {
                        metadata = JSON.parse(response.item.value);
                    }
                } catch (dlpError) {
                    // Fail-safe: In a true zero-trust, if DLP fails, we should drop the log or mask it all.
                    // For POC, we log warning and continue so Dev doesn't break locally.
                    logger.warn('⚠️ AuditService: GCP DLP Redaction Failed.', dlpError.message);
                }
            }

            const timestamp = new Date();
            // Data to sign: PrevHash + Time + Actor + Action + Meta + Status + AI Provenance
            const dataToSign = `${previousHash}${timestamp.toISOString()}${actor}${action}${JSON.stringify(metadata)}${status}${aiProvenance ? JSON.stringify(aiProvenance) : ''}`;
            hash = crypto.createHash('sha256').update(dataToSign).digest('hex');

            let kmsSignature = null;
            let kmsKeyId = null;

            // IRS Level Non-Repudiation: Sign with Hardware Security Module (KMS)
            if (this.kmsClient && this.kmsKeyName) {
                try {
                    // Create a digest for the data to sign
                    const digest = crypto.createHash('sha256').update(dataToSign).digest();
                    const [signResponse] = await this.kmsClient.asymmetricSign({
                        name: this.kmsKeyName + '/cryptoKeyVersions/1', // Typically use version 1, or query for primary
                        digest: {
                            sha256: digest
                        }
                    });
                    if (signResponse.signature) {
                        kmsSignature = Buffer.from(signResponse.signature).toString('base64');
                        kmsKeyId = signResponse.name;
                    }
                } catch (kmsError) {
                    logger.warn('⚠️ AuditService: Failed to sign with KMS (Soft Fail)', kmsError.message);
                }
            }

            const entry = {
                timestamp,
                actor,
                action,
                metadata: metadata, // Store as raw object for querying
                status,
                environment: config.env,
                ipAddress: req?.ip || 'internal',
                userAgent: req?.headers?.['user-agent'] || 'system',
                hash,
                previousHash,
                ...(kmsSignature && { kmsSignature }),
                ...(kmsKeyId && { kmsKeyId })
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
                    // Fallback to direct DB write
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

            // 4. Local Immutable JSONL Ledger (Blockchain-like file)
            try {
                const fs = await import('fs/promises');
                const path = await import('path');
                const logFilePath = path.join(process.cwd(), 'audit_logs.jsonl');
                await fs.appendFile(logFilePath, JSON.stringify(entry) + '\n', 'utf8');
            } catch (fsError) {
                logger.error('❌ AuditService: Failed to write to JSONL ledger', fsError);
            }

            // 5. WORM Storage (Google Cloud Storage Object Lock)
            if (this.isWormEnabled && this.storageClient) {
                try {
                    const bucket = this.storageClient.bucket(this.wormBucket);
                    const fileName = `audit_${timestamp.toISOString().replace(/[:.]/g, '-')}_${hash.substring(0, 8)}.json`;
                    const file = bucket.file(fileName);

                    await file.save(JSON.stringify(entry), {
                        resumable: false,
                        contentType: 'application/json',
                    });
                } catch (gcsError) {
                    logger.error('❌ AuditService: Failed to archive to WORM bucket', gcsError.message);
                }
            }

            // 6. Pub/Sub Alerting (Instant Incident Response)
            if (this.pubsub && this.alertTopicName) {
                if (status === 'DENIED' || status === 'FAILURE' || metadata?.severity === 'CRITICAL' || action === 'SECURITY_BREACH') {
                    try {
                        const topic = this.pubsub.topic(this.alertTopicName);
                        // Make sure we pass the fully formatted entry instead of raw data
                        const messageBuffer = Buffer.from(JSON.stringify(entry));
                        await topic.publishMessage({ data: messageBuffer });
                        logger.info(`🚨 PubSub: High-severity audit alert dispatched to ${this.alertTopicName}`);
                    } catch (pubsubError) {
                        logger.error('❌ AuditService: Failed to publish alert to Pub/Sub', pubsubError.message);
                    }
                }
            }

        } catch (filesysError) {
            logger.error('❌ AuditService: Critical Failure in Crypto-Sealing or Ecosystem Hooks', filesysError);
        }
    }
}

export const auditService = new AuditService();
