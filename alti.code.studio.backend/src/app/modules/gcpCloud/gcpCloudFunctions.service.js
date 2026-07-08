import { logger } from '../../../shared/logger.js';

class GcpCloudFunctionsService {
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
        logger.info('✅ Google Cloud Functions: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Functions init failed: ${e.message}`);
    }
  }

  _baseUrl(region) {
    const r = region || this.region;
    return `https://cloudfunctions.googleapis.com/v2/projects/${this.projectId}/locations/${r}`;
  }

  /**
   * List all Cloud Functions (2nd gen) in a region.
   * @param {string} [region] - GCP region (defaults to GCP_REGION env)
   * @returns {Promise<object[]>} Array of Cloud Functions
   */
  async listFunctions(region) {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._baseUrl(region)}/functions`;
        const res = await this.client.request({ url, method: 'GET' });
        const functions = res.data.functions || [];
        logger.info(`⚡ Cloud Functions: ${functions.length} functions in ${region || this.region}`);
        return functions;
      } catch (e) {
        logger.warn(`⚠️ Cloud Functions listFunctions failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Functions Mock: listFunctions(${region || this.region})`);
    return [];
  }

  /**
   * Get details for a specific Cloud Function.
   * @param {string} functionName - Short function name or fully qualified resource name
   * @returns {Promise<object>} Function details
   */
  async getFunction(functionName) {
    if (this.isInitialized && this.client) {
      try {
        const url = functionName.startsWith('projects/')
          ? `https://cloudfunctions.googleapis.com/v2/${functionName}`
          : `${this._baseUrl()}/functions/${functionName}`;
        const res = await this.client.request({ url, method: 'GET' });
        logger.info(`⚡ Cloud Functions: Retrieved function ${functionName}`);
        return res.data;
      } catch (e) {
        logger.warn(`⚠️ Cloud Functions getFunction failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Functions Mock: getFunction(${functionName})`);
    return {
      name: `projects/${this.projectId}/locations/${this.region}/functions/${functionName}`,
      state: 'ACTIVE',
      environment: 'GEN_2',
    };
  }

  /**
   * Call / invoke a Cloud Function by sending an HTTP request to its URL.
   * For 2nd gen functions, this retrieves the function's URI and POSTs data to it.
   * @param {string} functionName - Short function name or fully qualified resource name
   * @param {object} [data={}] - JSON payload to send to the function
   * @returns {Promise<object>} Function invocation result
   */
  async callFunction(functionName, data = {}) {
    if (this.isInitialized && this.client) {
      try {
        // First, get the function to find its service URI
        const fnDetails = await this.getFunction(functionName);
        const serviceUri = fnDetails?.serviceConfig?.uri;

        if (serviceUri) {
          // Use an ID-token-authenticated request for Cloud Run-backed functions
          const idTokenClient = await this.auth.getIdTokenClient(serviceUri);
          const res = await idTokenClient.request({
            url: serviceUri,
            method: 'POST',
            data,
            headers: { 'Content-Type': 'application/json' },
          });
          logger.info(`⚡ Cloud Functions: Invoked ${functionName} → ${res.status}`);
          return { status: res.status, data: res.data };
        }

        logger.warn(`⚠️ Cloud Functions: No service URI found for ${functionName}`);
        return { status: 404, data: null };
      } catch (e) {
        logger.warn(`⚠️ Cloud Functions callFunction failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Functions Mock: callFunction(${functionName})`);
    return { status: 200, data: { mock: true, input: data } };
  }
}

export const gcpCloudFunctionsService = new GcpCloudFunctionsService();
