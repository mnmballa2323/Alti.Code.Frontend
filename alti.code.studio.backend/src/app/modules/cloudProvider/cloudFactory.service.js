/**
 * Multi-Cloud Provider Factory
 *
 * Dynamically loads cloud-specific adapters (AWS, Azure, GCP, Local)
 * based on the CLOUD_PROVIDER environment variable.
 * Defaults to GCP to preserve existing sovereign enterprise configuration.
 */
import { logger } from '../../../shared/logger.js';

const CLOUD_PROVIDER = process.env.CLOUD_PROVIDER || 'GCP';

export class CloudProviderManager {
  static getProvider() {
    return CLOUD_PROVIDER.toUpperCase();
  }

  /**
   * Initializes Observability (Trace context propagation, Logging, etc.)
   */
  static async initializeObservability() {
    const provider = this.getProvider();
    try {
      if (provider === 'GCP') {
        const { initializeObservability } = await import('../gcpCloud/gcpObservability.service.js');
        return await initializeObservability();
      } else if (provider === 'AWS') {
        const { initializeObservability } = await import('../awsCloud/awsObservability.service.js');
        return await initializeObservability();
      } else if (provider === 'AZURE') {
        const { initializeObservability } = await import('../azureCloud/azureObservability.service.js');
        return await initializeObservability();
      } else {
        logger.info(`☁️ [${provider}] Observability bypassed.`);
      }
    } catch (err) {
      logger.warn(`⚠️ ${provider} Observability init bypassed: ${err.message}`);
    }
  }

  /**
   * Loads Enterprise Secrets (Key Vaults)
   */
  static async loadEnterpriseSecrets() {
    const provider = this.getProvider();
    try {
      const { loadEnterpriseSecrets } = await import('../../../../config/index.js');
      await loadEnterpriseSecrets();

      if (provider === 'GCP') {
        // GCP logic is handled internally in config/index.js for backward compatibility
        return;
      } else if (provider === 'AWS') {
        logger.info('☁️ [AWS] Enterprise Secrets loaded from AWS Secrets Manager (Stubbed)');
      } else if (provider === 'AZURE') {
        logger.info('☁️ [AZURE] Enterprise Secrets loaded from Azure Key Vault (Stubbed)');
      } else {
        logger.info(`☁️ [${provider}] Enterprise Secrets bypassed.`);
      }
    } catch (err) {
      logger.warn(`⚠️ ${provider} Enterprise Key Vault auto-inject bypassed: ${err.message}`);
    }
  }

  /**
   * Initializes Core Cloud Services (The "24 Services" in GCP)
   */
  static async initializeCoreServices() {
    const provider = this.getProvider();
    try {
      if (provider === 'GCP') {
        const { initializeGcpServices } = await import('../gcpCloud/gcpBootstrap.service.js');
        return await initializeGcpServices();
      } else if (provider === 'AWS') {
        const { initializeAwsServices } = await import('../awsCloud/awsBootstrap.service.js');
        return await initializeAwsServices();
      } else if (provider === 'AZURE') {
        const { initializeAzureServices } = await import('../azureCloud/azureBootstrap.service.js');
        return await initializeAzureServices();
      } else {
        logger.info(`☁️ [${provider}] Core Services initialized (Stubbed).`);
      }
    } catch (err) {
      logger.error(`❌ Failed to initialize ${provider} Cloud Platform`, err);
    }
  }

  /**
   * Graceful shutdown of active cloud services
   */
  static async shutdownServices() {
    const provider = this.getProvider();
    try {
      if (provider === 'GCP') {
        const { shutdownGcpServices } = await import('../gcpCloud/gcpBootstrap.service.js');
        return await shutdownGcpServices();
      } else if (provider === 'AWS') {
        const { shutdownAwsServices } = await import('../awsCloud/awsBootstrap.service.js');
        return await shutdownAwsServices();
      } else if (provider === 'AZURE') {
        const { shutdownAzureServices } = await import('../azureCloud/azureBootstrap.service.js');
        return await shutdownAzureServices();
      } else {
        logger.info(`✅ [${provider}] Cloud Platform shutdown complete (Stubbed).`);
      }
    } catch (err) {
      logger.warn(`⚠️ ${provider} shutdown bypassed: ${err.message}`);
    }
  }
}

export const cloudFactory = CloudProviderManager;
