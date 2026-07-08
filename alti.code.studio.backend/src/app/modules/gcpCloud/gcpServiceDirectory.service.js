import { logger } from '../../../shared/logger.js';

class GcpServiceDirectoryService {
  constructor() {
    this.registrationClient = null;
    this.lookupClient = null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID) {
        const servicedirectory = await import('@google-cloud/service-directory');
        this.registrationClient = new servicedirectory.RegistrationServiceClient();
        this.lookupClient = new servicedirectory.LookupServiceClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Service Directory: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Service Directory init failed: ${e.message}`);
    }
  }

  /**
   * Register a service with endpoints in a namespace.
   * @param {string} namespace - Fully qualified namespace name
   * @param {string} serviceId - Service identifier
   * @param {object[]} endpoints - Array of endpoint configs ({ endpointId, address, port, metadata })
   * @returns {Promise<object>} Registered service with endpoints
   */
  async registerService(namespace, serviceId, endpoints = []) {
    if (this.isInitialized && this.registrationClient) {
      try {
        // Create the service
        const [service] = await this.registrationClient.createService({
          parent: namespace,
          serviceId,
          service: {},
        });

        logger.info(`🗂️ Service Directory: Created service ${serviceId} in ${namespace}`);

        // Register endpoints
        const registeredEndpoints = [];
        for (const ep of endpoints) {
          try {
            const [endpoint] = await this.registrationClient.createEndpoint({
              parent: service.name,
              endpointId: ep.endpointId,
              endpoint: {
                address: ep.address,
                port: ep.port || 443,
                metadata: ep.metadata || {},
              },
            });
            registeredEndpoints.push(endpoint);
          } catch (epErr) {
            logger.warn(`⚠️ Service Directory: Failed to create endpoint ${ep.endpointId}: ${epErr.message}`);
          }
        }

        return { service, endpoints: registeredEndpoints };
      } catch (e) {
        logger.error(`❌ Service Directory registerService failed: ${e.message}`);
      }
    }

    logger.info(`🗂️ Service Directory Mock: registerService(${namespace}, ${serviceId})`);
    return { service: { name: `${namespace}/services/${serviceId}` }, endpoints: [] };
  }

  /**
   * Resolve a service to get its endpoints for routing.
   * @param {string} namespace - Fully qualified namespace name
   * @param {string} serviceId - Service identifier to resolve
   * @returns {Promise<object>} Resolved service with endpoints
   */
  async resolveService(namespace, serviceId) {
    if (this.isInitialized && this.lookupClient) {
      try {
        const serviceName = `${namespace}/services/${serviceId}`;
        const [response] = await this.lookupClient.resolveService({
          name: serviceName,
        });

        const endpoints = response.service?.endpoints || [];
        logger.info(`🔎 Service Directory: Resolved ${serviceId} → ${endpoints.length} endpoints`);
        return response.service;
      } catch (e) {
        logger.error(`❌ Service Directory resolveService failed: ${e.message}`);
      }
    }

    logger.info(`🔎 Service Directory Mock: resolveService(${namespace}, ${serviceId})`);
    return { name: `${namespace}/services/${serviceId}`, endpoints: [] };
  }

  /**
   * List all services within a namespace.
   * @param {string} namespace - Fully qualified namespace name
   * @returns {Promise<object[]>} Array of services
   */
  async listServices(namespace) {
    if (this.isInitialized && this.registrationClient) {
      try {
        const [services] = await this.registrationClient.listServices({
          parent: namespace,
        });

        logger.info(`📋 Service Directory: ${services.length} services in ${namespace}`);
        return services;
      } catch (e) {
        logger.error(`❌ Service Directory listServices failed: ${e.message}`);
      }
    }

    logger.info(`📋 Service Directory Mock: listServices(${namespace})`);
    return [];
  }
}

export const gcpServiceDirectoryService = new GcpServiceDirectoryService();
