import { logger } from '../../../shared/logger.js';

class GcpCloudArmorService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
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
      logger.info('✅ GCP Cloud Armor service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Cloud Armor init failed: ${e.message}`);
    }
  }

  async listPolicies() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpCloudArmor: Not initialized, returning mock');
      return { items: [] };
    }
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/global/securityPolicies`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudArmor.listPolicies failed: ${e.message}`);
      return { items: [] };
    }
  }

  async getPolicy(policyName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/global/securityPolicies/${policyName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudArmor.getPolicy failed: ${e.message}`);
      return null;
    }
  }

  async listRules(policyName) {
    if (!this.isInitialized || !this.client) return [];
    try {
      const policy = await this.getPolicy(policyName);
      return policy?.rules || [];
    } catch (e) {
      logger.warn(`GcpCloudArmor.listRules failed: ${e.message}`);
      return [];
    }
  }

  async addRule(policyName, rule) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://compute.googleapis.com/compute/v1/projects/${this.projectId}/global/securityPolicies/${policyName}/addRule`;
      const res = await this.client.request({ url, method: 'POST', data: rule });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudArmor.addRule failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpCloudArmorService = new GcpCloudArmorService();
