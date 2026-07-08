import { logger } from '../../../shared/logger.js';

class GcpMediaTranscoderService {
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
      logger.info('✅ GCP Media Transcoder service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Media Transcoder init failed: ${e.message}`);
    }
  }

  async createJob(inputUri, outputUri, preset = 'preset/web-hd') {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpMediaTranscoder: Not initialized');
      return null;
    }
    try {
      const url = `https://transcoder.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/jobs`;
      const body = {
        inputUri,
        outputUri,
        templateId: preset,
      };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpMediaTranscoder: Job created: ${res.data.name}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpMediaTranscoder.createJob failed: ${e.message}`);
      return null;
    }
  }

  async getJob(jobName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://transcoder.googleapis.com/v1/${jobName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpMediaTranscoder.getJob failed: ${e.message}`);
      return null;
    }
  }

  async listJobs() {
    if (!this.isInitialized || !this.client) return { jobs: [] };
    try {
      const url = `https://transcoder.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/jobs`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpMediaTranscoder.listJobs failed: ${e.message}`);
      return { jobs: [] };
    }
  }
}

export const gcpMediaTranscoderService = new GcpMediaTranscoderService();
