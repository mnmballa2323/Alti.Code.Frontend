import { logger } from '../../../shared/logger.js';

class GcpDataplexService {
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
        logger.info('✅ GCP Dataplex service initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ GCP Dataplex init failed: ${e.message}`);
    }
  }

  async listLakes() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpDataplex: Not initialized, returning empty');
      return { lakes: [] };
    }
    try {
      const url = `https://dataplex.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/lakes`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataplex.listLakes failed: ${e.message}`);
      return { lakes: [] };
    }
  }

  async getLake(lakeName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://dataplex.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/lakes/${lakeName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataplex.getLake failed: ${e.message}`);
      return null;
    }
  }

  async listZones(lakeName) {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpDataplex: Not initialized, returning empty');
      return { zones: [] };
    }
    try {
      const url = `https://dataplex.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/lakes/${lakeName}/zones`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataplex.listZones failed: ${e.message}`);
      return { zones: [] };
    }
  }

  async listAssets(lakeName, zoneName) {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpDataplex: Not initialized, returning empty');
      return { assets: [] };
    }
    try {
      const url = `https://dataplex.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/lakes/${lakeName}/zones/${zoneName}/assets`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataplex.listAssets failed: ${e.message}`);
      return { assets: [] };
    }
  }
}

export const gcpDataplexService = new GcpDataplexService();
