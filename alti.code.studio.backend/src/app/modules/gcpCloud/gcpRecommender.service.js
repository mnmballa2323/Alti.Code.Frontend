import { logger } from '../../../shared/logger.js';

class GcpRecommenderService {
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
      logger.info('✅ GCP Recommender service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Recommender init failed: ${e.message}`);
    }
  }

  async listRecommendations(recommenderType = 'google.compute.instance.MachineTypeRecommender') {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpRecommender: Not initialized, returning fallback');
      return { recommendations: [] };
    }
    try {
      const parent = `projects/${this.projectId}/locations/${this.region}/recommenders/${recommenderType}`;
      const url = `https://recommender.googleapis.com/v2/${parent}/recommendations`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpRecommender.listRecommendations failed: ${e.message}`);
      return { recommendations: [] };
    }
  }

  async listInsights(insightType = 'google.compute.instance.MachineTypeRecommender') {
    if (!this.isInitialized || !this.client) return { insights: [] };
    try {
      const parent = `projects/${this.projectId}/locations/${this.region}/insightTypes/${insightType}`;
      const url = `https://recommender.googleapis.com/v2/${parent}/insights`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpRecommender.listInsights failed: ${e.message}`);
      return { insights: [] };
    }
  }

  async applyRecommendation(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://recommender.googleapis.com/v2/${name}:markSucceeded`;
      const res = await this.client.request({ url, method: 'POST', data: { etag: '' } });
      return res.data;
    } catch (e) {
      logger.warn(`GcpRecommender.applyRecommendation failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpRecommenderService = new GcpRecommenderService();
