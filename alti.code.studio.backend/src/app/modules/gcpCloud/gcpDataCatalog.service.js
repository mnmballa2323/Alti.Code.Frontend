import { logger } from '../../../shared/logger.js';

class GcpDataCatalogService {
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
      logger.info('✅ GCP Data Catalog service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Data Catalog init failed: ${e.message}`);
    }
  }

  async searchCatalog(query) {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpDataCatalog: Not initialized, returning fallback');
      return { results: [] };
    }
    try {
      const url = 'https://datacatalog.googleapis.com/v1/catalog:search';
      const res = await this.client.request({
        url,
        method: 'POST',
        data: {
          scope: { includeProjectIds: [this.projectId] },
          query,
        },
      });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataCatalog.searchCatalog failed: ${e.message}`);
      return { results: [] };
    }
  }

  async getEntry(entryName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://datacatalog.googleapis.com/v1/${entryName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataCatalog.getEntry failed: ${e.message}`);
      return null;
    }
  }

  async listTags(entryName) {
    if (!this.isInitialized || !this.client) return { tags: [] };
    try {
      const url = `https://datacatalog.googleapis.com/v1/${entryName}/tags`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataCatalog.listTags failed: ${e.message}`);
      return { tags: [] };
    }
  }

  async createTag(entryName, tag) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://datacatalog.googleapis.com/v1/${entryName}/tags`;
      const res = await this.client.request({ url, method: 'POST', data: tag });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataCatalog.createTag failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpDataCatalogService = new GcpDataCatalogService();
