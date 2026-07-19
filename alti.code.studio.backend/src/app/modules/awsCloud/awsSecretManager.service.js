import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { logger } from '../../../shared/logger.js';

class AwsSecretManagerService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.AWS_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.AWS_ACCESS_KEY_ID ||
          process.env.AWS_PROFILE ||
          process.env.AWS_REGION
        ) {
          const region = process.env.AWS_REGION || 'us-east-1';
          this.client = new SecretsManagerClient({ region });
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ AWS Secret Manager initialization failed, falling back to env variables: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Retrieve secret from AWS Secrets Manager or env variables
   */
  async getSecret(secretId) {
    if (this.isInitialized && this.client) {
      try {
        const command = new GetSecretValueCommand({ SecretId: secretId });
        const response = await this.client.send(command);
        
        if (response.SecretString) {
          return response.SecretString;
        }
        
        if (response.SecretBinary) {
          const buff = Buffer.from(response.SecretBinary);
          return buff.toString('utf8');
        }
      } catch (e) {
        logger.error(
          `❌ AWS Secret Manager access failed for ${secretId}: ${e.message}`,
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
      `⚠️ AWS Secret Manager lookup for ${secretId} defaulted to empty string (local fallback).`,
    );
    return '';
  }
}

export const awsSecretManagerService = new AwsSecretManagerService();
export const SecretManagerService = awsSecretManagerService;
