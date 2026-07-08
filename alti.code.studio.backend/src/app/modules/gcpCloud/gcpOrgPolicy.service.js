import { logger } from '../../../shared/logger.js';

class GcpOrgPolicyService {
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
      logger.info('✅ GCP Org Policy service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Org Policy init failed: ${e.message}`);
    }
  }

  async listPolicies() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpOrgPolicy: Not initialized, returning fallback');
      return { policies: [] };
    }
    try {
      const url = `https://orgpolicy.googleapis.com/v2/projects/${this.projectId}/policies`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpOrgPolicy.listPolicies failed: ${e.message}`);
      return { policies: [] };
    }
  }

  async getPolicy(policyName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://orgpolicy.googleapis.com/v2/${policyName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpOrgPolicy.getPolicy failed: ${e.message}`);
      return null;
    }
  }

  async listConstraints() {
    if (!this.isInitialized || !this.client) return { constraints: [] };
    try {
      const url = `https://orgpolicy.googleapis.com/v2/projects/${this.projectId}/constraints`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpOrgPolicy.listConstraints failed: ${e.message}`);
      return { constraints: [] };
    }
  }
}

export const gcpOrgPolicyService = new GcpOrgPolicyService();
