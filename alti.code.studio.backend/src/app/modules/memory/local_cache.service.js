import { Level } from 'level';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import path from 'path';
import fs from 'fs';
import config from '../../../../config/index.js';

/**
 * Google LevelDB Local Disk Cache Service (with KMS Envelope Encryption).
 * Caching proprietary enterprise ASTs to local disk is a massive security vulnerability.
 * This service caches AST mappings to LevelDB, but uses Google Cloud KMS to implement
 * true Envelope Encryption. Every local AST chunk is encrypted with a unique local DEK,
 * which is mathematically wrapped by a centralized Google KMS KEK.
 */
class GoogleLevelDbService {
    constructor() {
        try {
            const dbPath = path.join(process.cwd(), '.alti_swarm_cache');
            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(dbPath, { recursive: true });
            }

            this.db = new Level(dbPath, { valueEncoding: 'json' });
            this.kmsClient = new KeyManagementServiceClient();
            
            // Assume the KEK is pre-configured via Terraform
            this.keyName = this.kmsClient.cryptoKeyPath(
                config.gcp.project_id,
                config.gcp.location || 'global',
                config.gcp.key_ring || 'alti-swarm-keyring',
                config.gcp.crypto_key || 'cache-kek'
            );

            logger.info('💽 [LevelDB+KMS] Google LevelDB Local AST Cache with Envelope Encryption initialized.');
        } catch (error) {
            logger.warn('⚠️ [LevelDB+KMS] Could not initialize LevelDB or KMS Client.');
        }
    }

    /**
     * Retrieves an encrypted AST payload and unwraps the DEK via Google KMS.
     * @param {string} astKey 
     */
    async getAstCache(astKey) {
        try {
            const data = await this.db.get(astKey);
            if (!data) return null;

            logger.info(`🔐 [LevelDB+KMS] Retrieving and unwrapping local AST cache...`);
            
            // 1. Unwrap the DEK using Google Cloud KMS
            const [decryptResponse] = await this.kmsClient.decrypt({
                name: this.keyName,
                ciphertext: Buffer.from(data.wrappedDek, 'base64')
            });
            const dek = decryptResponse.plaintext;

            // 2. Decrypt the local payload using the unwrapped DEK
            const decipher = crypto.createDecipheriv('aes-256-gcm', dek, Buffer.from(data.iv, 'base64'));
            decipher.setAuthTag(Buffer.from(data.authTag, 'base64'));
            let decrypted = decipher.update(data.ciphertext, 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            logger.info(`💽 [LevelDB+KMS] Envelope Decryption successful.`);
            return JSON.parse(decrypted);
        } catch (error) {
            if (error.code === 'LEVEL_NOT_FOUND') return null;
            logger.error(`❌ [LevelDB+KMS] Failed to read/decrypt from LevelDB:`, error.message);
            return null;
        }
    }

    /**
     * Persists an AST payload to the local NVMe cache using Envelope Encryption.
     * @param {string} astKey 
     * @param {object} astPayload 
     */
    async setAstCache(astKey, astPayload) {
        try {
            logger.info(`🔐 [LevelDB+KMS] Generating DEK and wrapping via KMS for local AST cache...`);
            
            // 1. Generate a local DEK (Data Encryption Key)
            const dek = crypto.randomBytes(32);
            const iv = crypto.randomBytes(16);

            // 2. Encrypt the payload using the DEK
            const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
            const payloadStr = JSON.stringify(astPayload);
            let ciphertext = cipher.update(payloadStr, 'utf8', 'base64');
            ciphertext += cipher.final('base64');
            const authTag = cipher.getAuthTag().toString('base64');

            // 3. Wrap the DEK using Google Cloud KMS (the KEK)
            const [encryptResponse] = await this.kmsClient.encrypt({
                name: this.keyName,
                plaintext: dek
            });
            const wrappedDek = encryptResponse.ciphertext.toString('base64');

            // 4. Store the encrypted payload + wrapped DEK to LevelDB
            const storedData = {
                wrappedDek,
                ciphertext,
                iv: iv.toString('base64'),
                authTag
            };

            await this.db.put(astKey, storedData);
            logger.info(`💽 [LevelDB+KMS] AST securely cached to physical disk with Envelope Encryption.`);
        } catch (error) {
            logger.error(`❌ [LevelDB+KMS] Failed to encrypt/write to LevelDB:`, error.message);
        }
    }
}

export const localCacheService = new GoogleLevelDbService();
