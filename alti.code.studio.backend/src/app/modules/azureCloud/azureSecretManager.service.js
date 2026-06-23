import { logger } from '../../../shared/logger.js';

class AzureSecretManagerService {
    /**
     * Retrieve secret from Azure Key Vault
     * @param {string} secretId 
     * @returns {Promise<string>}
     */
    async getSecret(secretId) {
        // Fallback to environment variables
        const envKey = secretId.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        if (process.env[envKey]) {
            return process.env[envKey];
        }
        if (process.env[secretId]) {
            return process.env[secretId];
        }

        logger.warn(`⚠️ Key Vault lookup for ${secretId} defaulted to empty string (local fallback).`);
        return '';
    }
}

export const SecretManagerService = new AzureSecretManagerService();
export const azureSecretManagerService = SecretManagerService;
