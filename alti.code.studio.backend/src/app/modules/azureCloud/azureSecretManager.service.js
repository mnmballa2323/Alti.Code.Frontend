import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { logger } from '../../../shared/logger.js';

class AzureSecretManagerService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.AZURE_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.AZURE_TENANT_ID &&
          process.env.AZURE_CLIENT_ID &&
          process.env.AZURE_CLIENT_SECRET &&
          process.env.AZURE_KEYVAULT_URL
        ) {
          const credential = new DefaultAzureCredential();
          this.client = new SecretClient(process.env.AZURE_KEYVAULT_URL, credential);
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Azure Key Vault initialization failed, falling back to env variables: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Retrieve secret from Azure Key Vault or env variables
   */
  async getSecret(secretId) {
    if (this.isInitialized && this.client) {
      try {
        const secretName = secretId.replace(/_/g, '-');
        const secret = await this.client.getSecret(secretName);
        return secret.value;
      } catch (e) {
        logger.error(
          `❌ Azure Key Vault access failed for ${secretId}: ${e.message}`,
        );
      }
    }

    // Fallback to environment variables
    const envKey = secretId.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    if (process.env[envKey]) {
      return process.env[envKey];
    }
    if (process.env[secretId]) {
      return process.env[secretId];
    }

    logger.warn(
      `⚠️ Azure Key Vault lookup for ${secretId} defaulted to empty string (local fallback).`,
    );
    return '';
  }
}

export const azureSecretManagerService = new AzureSecretManagerService();
export const SecretManagerService = azureSecretManagerService;
