import { logger } from '../../../shared/logger.js';

class GcpDataprocService {
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
      logger.info('✅ GCP Dataproc service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Dataproc init failed: ${e.message}`);
    }
  }

  async listClusters() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpDataproc: Not initialized, returning fallback');
      return { clusters: [] };
    }
    try {
      const url = `https://dataproc.googleapis.com/v1/projects/${this.projectId}/regions/${this.region}/clusters`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataproc.listClusters failed: ${e.message}`);
      return { clusters: [] };
    }
  }

  async createCluster(clusterConfig) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://dataproc.googleapis.com/v1/projects/${this.projectId}/regions/${this.region}/clusters`;
      const res = await this.client.request({ url, method: 'POST', data: clusterConfig });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataproc.createCluster failed: ${e.message}`);
      return null;
    }
  }

  async submitJob(jobConfig) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://dataproc.googleapis.com/v1/projects/${this.projectId}/regions/${this.region}/jobs:submit`;
      const res = await this.client.request({ url, method: 'POST', data: jobConfig });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataproc.submitJob failed: ${e.message}`);
      return null;
    }
  }

  async listJobs() {
    if (!this.isInitialized || !this.client) return { jobs: [] };
    try {
      const url = `https://dataproc.googleapis.com/v1/projects/${this.projectId}/regions/${this.region}/jobs`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDataproc.listJobs failed: ${e.message}`);
      return { jobs: [] };
    }
  }
}

export const gcpDataprocService = new GcpDataprocService();
