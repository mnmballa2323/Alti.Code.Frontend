import { logger } from '../../../shared/logger.js';

class GcpLoadBalancingService {
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
        logger.info('✅ GCP Load Balancing service initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ GCP Load Balancing init failed: ${e.message}`);
    }
  }

  async listForwardingRules() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpLoadBalancing: Not initialized, returning empty');
      return { items: [] };
    }
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/global/forwardingRules`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpLoadBalancing.listForwardingRules failed: ${e.message}`);
      return { items: [] };
    }
  }

  async getForwardingRule(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/global/forwardingRules/${name}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpLoadBalancing.getForwardingRule failed: ${e.message}`);
      return null;
    }
  }

  async listBackendServices() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpLoadBalancing: Not initialized, returning empty');
      return { items: [] };
    }
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/global/backendServices`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpLoadBalancing.listBackendServices failed: ${e.message}`);
      return { items: [] };
    }
  }

  async getBackendServiceHealth(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/global/backendServices/${name}/getHealth`;
      const res = await this.client.request({ url, method: 'POST', data: {} });
      return res.data;
    } catch (e) {
      logger.warn(`GcpLoadBalancing.getBackendServiceHealth failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpLoadBalancingService = new GcpLoadBalancingService();
