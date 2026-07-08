import { logger } from '../../../shared/logger.js';

class GcpApiGatewayService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
    this.region = process.env.GCP_REGION || 'us-central1';
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || this.projectId) {
        const { GoogleAuth } = await import('google-auth-library');
        this.auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        this.client = await this.auth.getClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud API Gateway: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud API Gateway init failed: ${e.message}`);
    }
  }

  _baseUrl() {
    return `https://apigateway.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}`;
  }

  _globalBaseUrl() {
    return `https://apigateway.googleapis.com/v1/projects/${this.projectId}/locations/global`;
  }

  /**
   * List all API Gateways in a region.
   * @param {string} [region] - GCP region (defaults to GCP_REGION env)
   * @returns {Promise<object[]>} Array of API Gateways
   */
  async listGateways(region) {
    if (this.isInitialized && this.client) {
      try {
        const base = region
          ? `https://apigateway.googleapis.com/v1/projects/${this.projectId}/locations/${region}`
          : this._baseUrl();
        const url = `${base}/gateways`;
        const res = await this.client.request({ url, method: 'GET' });
        const gateways = res.data.gateways || [];
        logger.info(`🌐 API Gateway: ${gateways.length} gateways in ${region || this.region}`);
        return gateways;
      } catch (e) {
        logger.warn(`⚠️ API Gateway listGateways failed: ${e.message}`);
      }
    }

    logger.info(`⚡ API Gateway Mock: listGateways(${region || this.region})`);
    return [];
  }

  /**
   * Get details for a specific API Gateway.
   * @param {string} gatewayName - Short gateway ID or fully qualified resource name
   * @returns {Promise<object>} Gateway details
   */
  async getGateway(gatewayName) {
    if (this.isInitialized && this.client) {
      try {
        const url = gatewayName.startsWith('projects/')
          ? `https://apigateway.googleapis.com/v1/${gatewayName}`
          : `${this._baseUrl()}/gateways/${gatewayName}`;
        const res = await this.client.request({ url, method: 'GET' });
        logger.info(`🌐 API Gateway: Retrieved gateway ${gatewayName}`);
        return res.data;
      } catch (e) {
        logger.warn(`⚠️ API Gateway getGateway failed: ${e.message}`);
      }
    }

    logger.info(`⚡ API Gateway Mock: getGateway(${gatewayName})`);
    return {
      name: `projects/${this.projectId}/locations/${this.region}/gateways/${gatewayName}`,
      state: 'ACTIVE',
      defaultHostname: `${gatewayName}-mock.apigateway.${this.projectId}.cloud.goog`,
    };
  }

  /**
   * List all APIs registered in API Gateway (global resource).
   * @returns {Promise<object[]>} Array of API definitions
   */
  async listApis() {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._globalBaseUrl()}/apis`;
        const res = await this.client.request({ url, method: 'GET' });
        const apis = res.data.apis || [];
        logger.info(`🌐 API Gateway: ${apis.length} APIs found`);
        return apis;
      } catch (e) {
        logger.warn(`⚠️ API Gateway listApis failed: ${e.message}`);
      }
    }

    logger.info('⚡ API Gateway Mock: listApis()');
    return [];
  }

  /**
   * Get a specific API config (OpenAPI spec / gateway config).
   * @param {string} apiName - Short API ID or fully qualified resource name
   * @returns {Promise<object[]>} Array of API configs
   */
  async getApiConfig(apiName) {
    if (this.isInitialized && this.client) {
      try {
        const parent = apiName.startsWith('projects/')
          ? apiName
          : `${this._globalBaseUrl()}/apis/${apiName}`;
        const url = `https://apigateway.googleapis.com/v1/${parent}/configs`;
        const res = await this.client.request({ url, method: 'GET' });
        const configs = res.data.apiConfigs || [];
        logger.info(`🌐 API Gateway: ${configs.length} configs for API ${apiName}`);
        return configs;
      } catch (e) {
        logger.warn(`⚠️ API Gateway getApiConfig failed: ${e.message}`);
      }
    }

    logger.info(`⚡ API Gateway Mock: getApiConfig(${apiName})`);
    return [];
  }
}

export const gcpApiGatewayService = new GcpApiGatewayService();
