import { logger } from '../../../shared/logger.js';

class GcpContainerSecurityService {
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
        logger.info('✅ GCP Container Security service initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ GCP Container Security init failed: ${e.message}`);
    }
  }

  async listVulnerabilities(resourceUri) {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpContainerSecurity: Not initialized, returning empty');
      return { occurrences: [] };
    }
    try {
      const filter = encodeURIComponent(`kind="VULNERABILITY" AND resourceUrl="${resourceUri}"`);
      const url = `https://containeranalysis.googleapis.com/v1/projects/${this.projectId}/occurrences?filter=${filter}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpContainerSecurity.listVulnerabilities failed: ${e.message}`);
      return { occurrences: [] };
    }
  }

  async getVulnerabilityReport(resourceUri) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const encodedUri = encodeURIComponent(resourceUri);
      const url = `https://containeranalysis.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/resourceVulnerabilityReport?resourceUri=${encodedUri}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpContainerSecurity.getVulnerabilityReport failed: ${e.message}`);
      return null;
    }
  }

  async listOccurrences(filter) {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpContainerSecurity: Not initialized, returning empty');
      return { occurrences: [] };
    }
    try {
      const encodedFilter = filter ? `?filter=${encodeURIComponent(filter)}` : '';
      const url = `https://containeranalysis.googleapis.com/v1/projects/${this.projectId}/occurrences${encodedFilter}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpContainerSecurity.listOccurrences failed: ${e.message}`);
      return { occurrences: [] };
    }
  }

  async getScanConfig() {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://containeranalysis.googleapis.com/v1/projects/${this.projectId}/scanConfigs`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpContainerSecurity.getScanConfig failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpContainerSecurityService = new GcpContainerSecurityService();
