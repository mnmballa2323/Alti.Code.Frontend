import { logger } from '../../../shared/logger.js';

class GcpAnthosService {
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
        logger.info('✅ GCP Anthos service initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ GCP Anthos init failed: ${e.message}`);
    }
  }

  async listMemberships() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpAnthos: Not initialized, returning empty');
      return { resources: [] };
    }
    try {
      const url = `https://gkehub.googleapis.com/v1/projects/${this.projectId}/locations/global/memberships`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpAnthos.listMemberships failed: ${e.message}`);
      return { resources: [] };
    }
  }

  async getMembership(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://gkehub.googleapis.com/v1/projects/${this.projectId}/locations/global/memberships/${name}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpAnthos.getMembership failed: ${e.message}`);
      return null;
    }
  }

  async listFeatures() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpAnthos: Not initialized, returning empty');
      return { resources: [] };
    }
    try {
      const url = `https://gkehub.googleapis.com/v1/projects/${this.projectId}/locations/global/features`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpAnthos.listFeatures failed: ${e.message}`);
      return { resources: [] };
    }
  }

  async getFeature(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://gkehub.googleapis.com/v1/projects/${this.projectId}/locations/global/features/${name}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpAnthos.getFeature failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpAnthosService = new GcpAnthosService();
