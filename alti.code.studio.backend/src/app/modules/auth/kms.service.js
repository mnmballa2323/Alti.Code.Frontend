/**
 * Copyright (c) 2026 Inso Code
 * 
 * Hardware Security Module (HSM) / Key Management Service (KMS) integration.
 * Connects to AWS KMS or Azure Key Vault to derive master encryption keys
 * rather than relying on plain-text environment variables.
 */

import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms";
import { logger } from '../../../shared/logger.js';

class KmsService {
    constructor() {
        this.client = new KMSClient({ region: process.env.AWS_REGION || "us-east-1" });
        this.masterKey = null;
    }

    /**
     * Initializes the KMS connection and decrypts the cipher text 
     * holding the master application key.
     */
    async initialize() {
        if (process.env.NODE_ENV !== 'production' && !process.env.KMS_CIPHERTEXT) {
            logger.info('[KMS] Running in local/dev mode. Bypassing KMS.');
            this.masterKey = process.env.FALLBACK_MASTER_KEY || 'local-dev-key-1234567890123456';
            return;
        }

        try {
            logger.info('[KMS] Fetching Customer Managed Key (CMK) from AWS KMS...');
            const command = new DecryptCommand({
                CiphertextBlob: Buffer.from(process.env.KMS_CIPHERTEXT, 'base64'),
            });
            const response = await this.client.send(command);
            this.masterKey = Buffer.from(response.Plaintext).toString('utf-8');
            logger.info('[KMS] Master Key successfully decrypted and loaded into memory.');
        } catch (error) {
            logger.error(`[CRITICAL] KMS Decryption failed. Halting application. Error: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Retrieves the master key to be used by MongoDB field-level encryption
     * or JWT signing algorithms.
     */
    getMasterKey() {
        if (!this.masterKey) {
            throw new Error('KMS Service not initialized. Cannot retrieve master key.');
        }
        return this.masterKey;
    }
}

export const kmsService = new KmsService();
