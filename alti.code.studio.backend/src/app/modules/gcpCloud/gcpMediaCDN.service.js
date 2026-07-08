import { logger } from '../../../shared/logger.js';

class GcpMediaCDNService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
    this.region = process.env.GCP_REGION || 'us-central1';
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    try {
      if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !this.projectId) return;

      const { GoogleAuth } = await import('google-auth-library');
      this.auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
      this.client = await this.auth.getClient();
      this.projectId = this.projectId || await this.auth.getProjectId();
      this.isInitialized = true;
      logger.info('✅ GCP Media CDN service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Media CDN init failed: ${e.message}`);
    }
  }

  /**
   * List all Edge Cache services in the project.
   * @returns {Promise<object>} Edge Cache services list
   */
  async listEdgeCacheServices() {
    if (!this.isInitialized || !this.client) return { edgeCacheServices: [] };
    try {
      const url = `https://networkservices.googleapis.com/v1/projects/${this.projectId}/locations/global/edgeCacheServices`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpMediaCDN.listEdgeCacheServices failed: ${e.message}`);
      return { edgeCacheServices: [] };
    }
  }

  /**
   * Get a specific Edge Cache service by name.
   * @param {string} name - Full resource name (projects/{project}/locations/global/edgeCacheServices/{service})
   * @returns {Promise<object|null>} Edge Cache service details
   */
  async getEdgeCacheService(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://networkservices.googleapis.com/v1/${name}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpMediaCDN.getEdgeCacheService failed: ${e.message}`);
      return null;
    }
  }

  /**
   * List all Edge Cache origins in the project.
   * @returns {Promise<object>} Edge Cache origins list
   */
  async listEdgeCacheOrigins() {
    if (!this.isInitialized || !this.client) return { edgeCacheOrigins: [] };
    try {
      const url = `https://networkservices.googleapis.com/v1/projects/${this.projectId}/locations/global/edgeCacheOrigins`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpMediaCDN.listEdgeCacheOrigins failed: ${e.message}`);
      return { edgeCacheOrigins: [] };
    }
  }

  /**
   * Purge cached content from an Edge Cache service.
   * @param {string} serviceName - Full Edge Cache service resource name
   * @param {Array<string>} urls - Array of URL patterns to purge
   * @returns {Promise<object|null>} Purge operation result
   */
  async purgeCache(serviceName, urls = []) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://networkservices.googleapis.com/v1/${serviceName}:invalidateCache`;
      const body = { urlPatterns: urls };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpMediaCDN: Cache purged for ${urls.length} URL pattern(s)`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpMediaCDN.purgeCache failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpMediaCDNService = new GcpMediaCDNService();
