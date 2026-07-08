import { logger } from '../../../shared/logger.js';

class GcpPrivateServiceConnectService {
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
        logger.info('✅ GCP Private Service Connect service initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ GCP Private Service Connect init failed: ${e.message}`);
    }
  }

  async listServiceAttachments() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpPrivateServiceConnect: Not initialized, returning empty');
      return { items: [] };
    }
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/regions/${this.region}/serviceAttachments`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpPrivateServiceConnect.listServiceAttachments failed: ${e.message}`);
      return { items: [] };
    }
  }

  async getServiceAttachment(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/regions/${this.region}/serviceAttachments/${name}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpPrivateServiceConnect.getServiceAttachment failed: ${e.message}`);
      return null;
    }
  }

  async listEndpoints() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpPrivateServiceConnect: Not initialized, returning empty');
      return { items: [] };
    }
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/regions/${this.region}/forwardingRules`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpPrivateServiceConnect.listEndpoints failed: ${e.message}`);
      return { items: [] };
    }
  }

  async getEndpoint(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/regions/${this.region}/forwardingRules/${name}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpPrivateServiceConnect.getEndpoint failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpPrivateServiceConnectService = new GcpPrivateServiceConnectService();
