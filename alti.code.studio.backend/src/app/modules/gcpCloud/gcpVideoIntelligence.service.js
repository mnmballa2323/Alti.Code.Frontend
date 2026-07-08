import { logger } from '../../../shared/logger.js';

class GcpVideoIntelligenceService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
    this.isInitialized = false;
    this.supportedFeatures = [
      'LABEL_DETECTION',
      'SHOT_CHANGE_DETECTION',
      'TEXT_DETECTION',
      'OBJECT_TRACKING',
    ];
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
      logger.info('✅ GCP Video Intelligence service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Video Intelligence init failed: ${e.message}`);
    }
  }

  /**
   * Annotate a video with specified features (long-running operation).
   * @param {string} videoUri - GCS URI (gs://bucket/video.mp4)
   * @param {Array<string>} features - Array of feature types (e.g., ['LABEL_DETECTION', 'TEXT_DETECTION'])
   * @returns {Promise<object|null>} Long-running operation
   */
  async annotateVideo(videoUri, features = ['LABEL_DETECTION']) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = 'https://videointelligence.googleapis.com/v1/videos:annotate';
      const validFeatures = features.filter((f) => this.supportedFeatures.includes(f));
      if (validFeatures.length === 0) {
        logger.warn('GcpVideoIntelligence: No valid features specified');
        return null;
      }
      const body = {
        inputUri: videoUri,
        features: validFeatures,
      };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpVideoIntelligence: Video annotation started: ${res.data.name}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpVideoIntelligence.annotateVideo failed: ${e.message}`);
      return null;
    }
  }

  /**
   * Get the status/result of a long-running operation.
   * @param {string} operationName - Full operation resource name
   * @returns {Promise<object|null>} Operation status/result
   */
  async getOperation(operationName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://videointelligence.googleapis.com/v1/${operationName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpVideoIntelligence.getOperation failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpVideoIntelligenceService = new GcpVideoIntelligenceService();
