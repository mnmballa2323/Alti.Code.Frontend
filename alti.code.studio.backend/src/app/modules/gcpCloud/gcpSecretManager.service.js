import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from '../../../shared/logger.js';

class GcpSecretManagerService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.GCP_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GCP_PROJECT_ID
        ) {
          this.client = new SecretManagerServiceClient();
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud Secret Manager initialization failed, falling back to env variables: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Retrieve secret from GCP Secret Manager or env variables
   */
  async getSecret(secretId) {
    if (this.isInitialized && this.client) {
      try {
        const projectId = process.env.GCP_PROJECT_ID || 'alti-code-studio';
        const [version] = await this.client.accessSecretVersion({
          name: `projects/${projectId}/secrets/${secretId}/versions/latest`,
        });
        return version.payload.data.toString('utf8');
      } catch (e) {
        logger.error(
          `❌ GCP Secret Manager access failed for ${secretId}: ${e.message}`,
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
      `⚠️ GCP Secret Manager lookup for ${secretId} defaulted to empty string (local fallback).`,
    );
    return '';
  }
}

export const gcpSecretManagerService = new GcpSecretManagerService();
export const SecretManagerService = gcpSecretManagerService;
export const azureSecretManagerService = gcpSecretManagerService;
