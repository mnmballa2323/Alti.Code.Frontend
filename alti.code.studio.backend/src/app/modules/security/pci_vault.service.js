/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * PCI-DSS Level 1 Vault Service
 * Uses AWS KMS for Envelope Encryption & Tokenization of PANs/Financial Data
 */

import crypto from 'crypto';
import { KMSClient, GenerateDataKeyCommand, DecryptCommand } from '@aws-sdk/client-kms';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

// Fallback to us-east-1 if region not configured
const kmsClient = new KMSClient({ region: config.aws?.region || 'us-east-1' });

class PCIVaultService {
    constructor() {
        // We use a predefined Alias or Key ID from config.
        // Fallback to a placeholder string (must be replaced in production)
        this.keyId = config.aws?.kms_key_id || 'alias/alti-pci-vault';
    }

    /**
     * Tokenize and encrypt raw financial data (e.g. Credit Card PAN, Routing Number)
     * using AWS KMS Envelope Encryption.
     * @param {string} plaintextData 
     * @returns {Promise<Object>} The secure token and cipher metadata
     */
    async tokenize(plaintextData) {
        if (!plaintextData) {
            throw new Error('PCI Vault: Missing data to tokenize');
        }

        try {
            // 1. Generate a Data Key from KMS
            const command = new GenerateDataKeyCommand({
                KeyId: this.keyId,
                KeySpec: 'AES_256'
            });
            const dataKeyResponse = await kmsClient.send(command);
            
            // 2. Encrypt the plaintext locally using the plaintext data key
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(dataKeyResponse.Plaintext), iv);
            
            let encrypted = cipher.update(plaintextData, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag().toString('hex');

            // 3. Destroy the plaintext data key from memory immediately for compliance
            dataKeyResponse.Plaintext.fill(0);

            // 4. Return the token containing the KMS-encrypted data key, IV, and cipher text
            const token = Buffer.from(dataKeyResponse.CiphertextBlob).toString('base64');
            
            logger.info('🔒 [PCIVault] Successfully generated KMS envelope token for financial data.');
            
            return {
                token: token,
                iv: iv.toString('hex'),
                authTag: authTag,
                cipherText: encrypted
            };
        } catch (error) {
            logger.error(`❌ [PCIVault] Failed to tokenize data: ${error.message}`);
            // In a real environment, you might fallback to local mock encryption if AWS is disabled in dev mode.
            // But for PCI compliance, we strictly fail.
            throw new Error('PCI Vault Encryption Failed');
        }
    }

    /**
     * Detokenize to retrieve raw financial data using AWS KMS
     * @param {Object} vaultRecord 
     * @returns {Promise<string>} The decrypted plaintext string
     */
    async detokenize(vaultRecord) {
        if (!vaultRecord || !vaultRecord.token || !vaultRecord.iv || !vaultRecord.authTag || !vaultRecord.cipherText) {
            throw new Error('PCI Vault: Invalid vault record structure');
        }

        try {
            // 1. Decrypt the Data Key using KMS
            const command = new DecryptCommand({
                CiphertextBlob: Buffer.from(vaultRecord.token, 'base64')
            });
            const decryptResponse = await kmsClient.send(command);

            // 2. Decrypt the ciphertext locally using the returned plaintext key
            const decipher = crypto.createDecipheriv(
                'aes-256-gcm', 
                Buffer.from(decryptResponse.Plaintext), 
                Buffer.from(vaultRecord.iv, 'hex')
            );
            decipher.setAuthTag(Buffer.from(vaultRecord.authTag, 'hex'));

            let decrypted = decipher.update(vaultRecord.cipherText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            // 3. Destroy the plaintext data key from memory
            decryptResponse.Plaintext.fill(0);

            logger.info('🔓 [PCIVault] Successfully decrypted KMS envelope token.');

            return decrypted;
        } catch (error) {
            logger.error(`❌ [PCIVault] Failed to detokenize data: ${error.message}`);
            throw new Error('PCI Vault Decryption Failed');
        }
    }
}

export const pciVaultService = new PCIVaultService();
