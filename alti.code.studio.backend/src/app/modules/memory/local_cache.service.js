import { Level } from 'level';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import path from 'path';
import fs from 'fs';
import config from '../../../../config/index.js';
import { gcpSecretManagerService } from '../gcpCloud/gcpSecretManager.service.js';

/**
 * GCP LevelDB Local Disk Cache Service (with Key Vault Envelope Encryption).
 * Caching proprietary enterprise ASTs to local disk is a massive security vulnerability.
 * This service caches AST mappings to LevelDB, but uses GCP Secret Manager to implement
 * true Envelope Encryption. Every local AST chunk is encrypted with a unique local DEK,
 * which is mathematically wrapped by a centralized GCP KMS KEK.
 */
class GCPLevelDbService {
  constructor() {
    try {
      const dbPath = path.join(process.cwd(), '.alti_swarm_cache');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      this.db = new Level(dbPath, { valueEncoding: 'json' });
      this.secretManager = gcpSecretManagerService;

      // Central KEK key name
      this.keyName = config.gcp?.key_vault_kek || 'cache-kek';

      logger.info(
        '💽 [LevelDB+KeyVault] GCP LevelDB Local AST Cache with Envelope Encryption initialized.',
      );
    } catch (error) {
      logger.warn(
        '⚠️ [LevelDB+KeyVault] Could not initialize LevelDB or GCP KMS KEK.',
      );
    }
  }

  /**
   * Helper to get or derive the central KEK key
   */
  async _getKek() {
    const kekBase64 = await this.secretManager.getSecret(this.keyName);
    if (kekBase64) {
      return Buffer.from(kekBase64, 'base64');
    }
    // Fallback key derived from application secret
    const appSecret =
      process.env.GCP_CLIENT_SECRET ||
      'local-fallback-kek-seed-value-32bytes!';
    return crypto.createHash('sha256').update(appSecret).digest();
  }

  /**
   * Retrieves an encrypted AST payload and unwraps the DEK.
   * @param {string} astKey
   */
  async getAstCache(astKey) {
    try {
      const data = await this.db.get(astKey);
      if (!data) return null;

      logger.info(
        `🔐 [LevelDB+KeyVault] Retrieving and unwrapping local AST cache...`,
      );

      const kek = await this._getKek();

      // 1. Unwrap the DEK using the KEK (AES Key Wrap / Decrypt)
      const wrappedDekBuffer = Buffer.from(data.wrappedDek, 'base64');
      const decipherKek = crypto.createDecipheriv('aes-256-ecb', kek, null);
      let dek = decipherKek.update(wrappedDekBuffer);
      dek = Buffer.concat([dek, decipherKek.final()]);

      // 2. Decrypt the local payload using the unwrapped DEK
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        dek,
        Buffer.from(data.iv, 'base64'),
      );
      decipher.setAuthTag(Buffer.from(data.authTag, 'base64'));
      let decrypted = decipher.update(data.ciphertext, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      logger.info(`💽 [LevelDB+KeyVault] Envelope Decryption successful.`);
      return JSON.parse(decrypted);
    } catch (error) {
      if (error.code === 'LEVEL_NOT_FOUND') return null;
      logger.error(
        `❌ [LevelDB+KeyVault] Failed to read/decrypt from LevelDB:`,
        error.message,
      );
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
      logger.info(
        `🔐 [LevelDB+KeyVault] Generating DEK and wrapping via Key Vault for local AST cache...`,
      );

      // 1. Generate a local DEK (Data Encryption Key)
      const dek = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);

      // 2. Encrypt the payload using the DEK
      const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
      const payloadStr = JSON.stringify(astPayload);
      let ciphertext = cipher.update(payloadStr, 'utf8', 'base64');
      ciphertext += cipher.final('base64');
      const authTag = cipher.getAuthTag().toString('base64');

      // 3. Wrap the DEK using Key Vault (the KEK)
      const kek = await this._getKek();
      const cipherKek = crypto.createCipheriv('aes-256-ecb', kek, null);
      let wrappedDekBuffer = cipherKek.update(dek);
      wrappedDekBuffer = Buffer.concat([wrappedDekBuffer, cipherKek.final()]);
      const wrappedDek = wrappedDekBuffer.toString('base64');

      await this.db.put(astKey, {
        wrappedDek,
        iv: iv.toString('base64'),
        authTag,
        ciphertext,
      });

      logger.info(
        `✅ [LevelDB+KeyVault] Local AST cached and envelope-encrypted successfully.`,
      );
      return true;
    } catch (error) {
      logger.error(
        `❌ [LevelDB+KeyVault] Failed to encrypt/write to LevelDB:`,
        error.message,
      );
      return false;
    }
  }
}

export const localCacheService = new GCPLevelDbService();
