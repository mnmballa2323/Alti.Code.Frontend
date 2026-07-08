import { logger } from '../../../shared/logger.js';

class GcpCloudNATService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
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
        this.projectId = this.projectId || await this.auth.getProjectId();
        this.isInitialized = true;
        logger.info('✅ GCP Cloud NAT service initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ GCP Cloud NAT init failed: ${e.message}`);
    }
  }

  async listRouters() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpCloudNAT: Not initialized, returning empty');
      return { items: [] };
    }
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/regions/${this.region}/routers`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudNAT.listRouters failed: ${e.message}`);
      return { items: [] };
    }
  }

  async getRouter(routerName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/regions/${this.region}/routers/${routerName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudNAT.getRouter failed: ${e.message}`);
      return null;
    }
  }

  async getNatStatus(routerName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/regions/${this.region}/routers/${routerName}/getNatMappingInfo`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudNAT.getNatStatus failed: ${e.message}`);
      return null;
    }
  }

  async getNatMappings(routerName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/regions/${this.region}/routers/${routerName}/getNatMappingInfo`;
      const res = await this.client.request({ url });
      return res.data?.result || [];
    } catch (e) {
      logger.warn(`GcpCloudNAT.getNatMappings failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpCloudNATService = new GcpCloudNATService();
