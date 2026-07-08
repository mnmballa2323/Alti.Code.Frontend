import { logger } from '../../../shared/logger.js';

class GcpComposerService {
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
      logger.info('✅ GCP Cloud Composer service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Cloud Composer init failed: ${e.message}`);
    }
  }

  async listEnvironments() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpComposer: Not initialized, returning fallback');
      return { environments: [] };
    }
    try {
      const url = `https://composer.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/environments`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpComposer.listEnvironments failed: ${e.message}`);
      return { environments: [] };
    }
  }

  async getEnvironment(envName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://composer.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/environments/${envName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpComposer.getEnvironment failed: ${e.message}`);
      return null;
    }
  }

  async updateEnvironment(envName, updateMask, body) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://composer.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/environments/${envName}?updateMask=${updateMask}`;
      const res = await this.client.request({ url, method: 'PATCH', data: body });
      return res.data;
    } catch (e) {
      logger.warn(`GcpComposer.updateEnvironment failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpComposerService = new GcpComposerService();
