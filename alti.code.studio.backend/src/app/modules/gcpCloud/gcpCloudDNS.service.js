import { logger } from '../../../shared/logger.js';

class GcpCloudDNSService {
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
      logger.info('✅ GCP Cloud DNS service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Cloud DNS init failed: ${e.message}`);
    }
  }

  async listZones() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpCloudDNS: Not initialized, returning fallback');
      return { managedZones: [] };
    }
    try {
      const url = `https://dns.googleapis.com/v1/projects/${this.projectId}/managedZones`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudDNS.listZones failed: ${e.message}`);
      return { managedZones: [] };
    }
  }

  async getZone(zoneName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://dns.googleapis.com/v1/projects/${this.projectId}/managedZones/${zoneName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudDNS.getZone failed: ${e.message}`);
      return null;
    }
  }

  async listRecordSets(zoneName) {
    if (!this.isInitialized || !this.client) return { rrsets: [] };
    try {
      const url = `https://dns.googleapis.com/v1/projects/${this.projectId}/managedZones/${zoneName}/rrsets`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudDNS.listRecordSets failed: ${e.message}`);
      return { rrsets: [] };
    }
  }

  async createRecordSet(zoneName, record) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://dns.googleapis.com/v1/projects/${this.projectId}/managedZones/${zoneName}/rrsets`;
      const res = await this.client.request({ url, method: 'POST', data: record });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudDNS.createRecordSet failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpCloudDNSService = new GcpCloudDNSService();
