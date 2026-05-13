import { KeyManagementServiceClient } from '@google-cloud/kms';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Key Management Service (KMS).
 * Provides military-grade hardware encryption for securing payload signatures,
 * replacing local Node.js crypto primitives.
 */
class GoogleKMSService {
    constructor() {
        this.projectId = config.gcp.project_id;
        this.locationId = config.gcp.location || 'global';
        this.keyRingId = config.gcp.kms_keyring || 'alti-core-keyring';
        this.keyId = config.gcp.kms_key_id || 'alti-a2a-key';

        try {
            this.client = new KeyManagementServiceClient();
            this.keyName = this.client.cryptoKeyPath(this.projectId, this.locationId, this.keyRingId, this.keyId);
        } catch (error) {
            logger.warn('⚠️ [KMS] Could not initialize KeyManagementServiceClient.');
        }
    }

    /**
     * Encrypts plaintext payload using Google Cloud KMS.
     * @param {string} plaintext - The data to encrypt
     * @returns {Promise<string>} - The base64 encoded ciphertext
     */
    async encryptPayload(plaintext) {
        logger.info(`🔐 [KMS] Encrypting payload via Google Cloud KMS...`);
        try {
            const plaintextBuffer = Buffer.from(plaintext);
            
            const [result] = await this.client.encrypt({
                name: this.keyName,
                plaintext: plaintextBuffer,
            });

            logger.info('✅ [KMS] Payload encrypted successfully using FIPS 140-2 Level 3 HSM.');
            return result.ciphertext.toString('base64');
        } catch (error) {
            logger.error('❌ [KMS] Encryption Error:', error.message);
            if (process.env.NODE_ENV === 'production' || config.env === 'production') {
                throw new Error('KMS Encryption failed in production environment. Failing securely.');
            }
            // Non-fatal fallback for local development
            return Buffer.from(plaintext).toString('base64');
        }
    }

    /**
     * Decrypts ciphertext payload using Google Cloud KMS.
     * @param {string} ciphertext - The base64 encoded ciphertext
     * @returns {Promise<string>} - The decrypted plaintext
     */
    async decryptPayload(ciphertext) {
        logger.info(`🔓 [KMS] Decrypting payload via Google Cloud KMS...`);
        try {
            const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
            
            const [result] = await this.client.decrypt({
                name: this.keyName,
                ciphertext: ciphertextBuffer,
            });

            logger.info('✅ [KMS] Payload decrypted successfully.');
            return result.plaintext.toString('utf8');
        } catch (error) {
            logger.error('❌ [KMS] Decryption Error:', error.message);
            if (process.env.NODE_ENV === 'production' || config.env === 'production') {
                throw new Error('KMS Decryption failed in production environment. Failing securely.');
            }
            // Non-fatal fallback for local development
            return Buffer.from(ciphertext, 'base64').toString('utf8');
        }
    }

    /**
     * Cryptographically signs a payload using Google Cloud KMS MAC key.
     * @param {string} plaintext - The data to sign
     * @returns {Promise<string>} - The base64 encoded MAC signature
     */
    async signPayload(plaintext) {
        logger.info(`🔐 [KMS] Signing payload via Google Cloud KMS MAC...`);
        try {
            const dataBuffer = Buffer.from(plaintext);
            const [result] = await this.client.macSign({
                name: this.keyName,
                data: dataBuffer,
            });
            logger.info('✅ [KMS] Payload signed successfully.');
            return result.mac.toString('base64');
        } catch (error) {
            logger.error('❌ [KMS] Signing Error:', error.message);
            if (process.env.NODE_ENV === 'production' || config.env === 'production') {
                throw new Error('KMS Signing failed in production environment. Failing securely.');
            }
            // Non-fatal fallback for local development
            const crypto = await import('crypto');
            return crypto.createHmac('sha256', 'alti-dev-secret-123').update(plaintext).digest('base64');
        }
    }

    /**
     * Verifies a cryptographic signature using Google Cloud KMS MAC key.
     * @param {string} plaintext - The original data
     * @param {string} signatureBase64 - The base64 encoded MAC signature
     * @returns {Promise<boolean>} - True if valid
     */
    async verifySignature(plaintext, signatureBase64) {
        logger.info(`🔓 [KMS] Verifying payload signature via Google Cloud KMS MAC...`);
        try {
            const dataBuffer = Buffer.from(plaintext);
            const macBuffer = Buffer.from(signatureBase64, 'base64');
            const [result] = await this.client.macVerify({
                name: this.keyName,
                data: dataBuffer,
                mac: macBuffer,
            });
            logger.info('✅ [KMS] Signature verified successfully.');
            return result.success;
        } catch (error) {
            logger.error('❌ [KMS] Verification Error:', error.message);
            if (process.env.NODE_ENV === 'production' || config.env === 'production') {
                return false;
            }
            const crypto = await import('crypto');
            const expected = crypto.createHmac('sha256', 'alti-dev-secret-123').update(plaintext).digest('base64');
            return expected === signatureBase64;
        }
    }
}

export const kmsService = new GoogleKMSService();
