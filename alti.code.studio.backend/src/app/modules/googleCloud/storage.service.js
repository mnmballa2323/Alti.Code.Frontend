import { Storage } from '@google-cloud/storage';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

class GoogleCloudStorageService {
    constructor() {
        this.localFallbackDir = './logs/gcs_mock';
        this.isGcpConnected = false;
        
        const hasGcpCreds = (() => {
            if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
                return false;
            }
            if (process.env.PRIVATE_CLOUD_MODE === 'true') {
                return false;
            }
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                return true;
            }
            if (process.env.K_SERVICE || process.env.GAE_SERVICE || process.env.CLOUD_RUN_JOB || process.env.KUBERNETES_SERVICE_HOST) {
                return true;
            }
            return false;
        })();

        try {
            mkdirSync(this.localFallbackDir, { recursive: true });
            
            if (hasGcpCreds) {
                // Try to initialize GCS client with Application Default Credentials
                this.storage = new Storage();
                this.isGcpConnected = true;
                logger.info('☁️  [GCS Service] Google Cloud Storage Client initialized.');
            } else {
                logger.info('☁️  [GCS Service] GCP credentials not active or local environment. Activating local sandbox fallback.');
                this.isGcpConnected = false;
            }
        } catch (e) {
            logger.warn(`⚠️  [GCS Service] GCS auth unavailable: ${e.message}. Activating local sandbox fallback.`);
            this.isGcpConnected = false;
        }
    }

    /**
     * Uploads text content to a GCS Bucket, cascading to local storage when offline.
     * @param {string} bucketName - Target bucket
     * @param {string} destFileName - Target file path in bucket
     * @param {string} content - Contents to write
     * @returns {Promise<boolean>} Success indicator
     */
    async uploadContent(bucketName, destFileName, content) {
        if (this.isGcpConnected && this.storage) {
            try {
                logger.info(`☁️  [GCS Service] Uploading to gs://${bucketName}/${destFileName}...`);
                const bucket = this.storage.bucket(bucketName);
                const file = bucket.file(destFileName);
                await file.save(content, {
                    metadata: { contentType: 'application/json' },
                    resumable: false
                });
                return true;
            } catch (err) {
                logger.warn(`⚠️  [GCS Service] GCP GCS write failed: ${err.message}. Falling back to local file archiving.`);
            }
        }

        // Local Sandbox Fallback
        try {
            const hostPath = path.resolve(path.join(this.localFallbackDir, bucketName, destFileName));
            const parentDir = path.dirname(hostPath);
            await fs.mkdir(parentDir, { recursive: true });
            await fs.writeFile(hostPath, content, 'utf8');
            logger.info(`💾 [GCS Fallback] Archived gs://${bucketName}/${destFileName} locally at: ${hostPath}`);
            return true;
        } catch (localErr) {
            logger.error(`❌ [GCS Fallback] Local archive failed: ${localErr.message}`);
            return false;
        }
    }

    /**
     * Downloads text content from a GCS Bucket, cascading to local storage when offline.
     * @param {string} bucketName - Target bucket
     * @param {string} srcFileName - Target file path in bucket
     * @returns {Promise<string>} Content downloaded
     */
    async downloadContent(bucketName, srcFileName) {
        if (this.isGcpConnected && this.storage) {
            try {
                logger.info(`☁️  [GCS Service] Downloading gs://${bucketName}/${srcFileName}...`);
                const bucket = this.storage.bucket(bucketName);
                const file = bucket.file(srcFileName);
                const [content] = await file.download();
                return content.toString('utf8');
            } catch (err) {
                logger.warn(`⚠️  [GCS Service] GCP GCS read failed: ${err.message}. Cascading to local archive.`);
            }
        }

        // Local Sandbox Fallback
        try {
            const hostPath = path.resolve(path.join(this.localFallbackDir, bucketName, srcFileName));
            if (existsSync(hostPath)) {
                return await fs.readFile(hostPath, 'utf8');
            }
            throw new Error(`File gs://${bucketName}/${srcFileName} not found in local GCS mock archive.`);
        } catch (localErr) {
            logger.error(`❌ [GCS Fallback] Local retrieval failed: ${localErr.message}`);
            throw localErr;
        }
    }
}

export const gcsService = new GoogleCloudStorageService();
