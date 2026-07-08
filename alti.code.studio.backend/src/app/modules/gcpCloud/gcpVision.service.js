import { logger } from '../../../shared/logger.js';

class GcpVisionService {
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
      logger.info('✅ GCP Cloud Vision service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Cloud Vision init failed: ${e.message}`);
    }
  }

  /**
   * Annotate an image with specified features.
   * @param {string} imageUri - GCS URI (gs://bucket/image.jpg) or public URL
   * @param {Array<object>} features - Array of { type, maxResults } (e.g., [{ type: 'LABEL_DETECTION', maxResults: 10 }])
   * @returns {Promise<object|null>} Annotation results
   */
  async annotateImage(imageUri, features = []) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = 'https://vision.googleapis.com/v1/images:annotate';
      const image = imageUri.startsWith('gs://')
        ? { source: { gcsImageUri: imageUri } }
        : { source: { imageUri } };
      const body = {
        requests: [{ image, features }],
      };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpVision: Image annotated with ${features.length} feature(s)`);
      return res.data.responses?.[0] || null;
    } catch (e) {
      logger.warn(`GcpVision.annotateImage failed: ${e.message}`);
      return null;
    }
  }

  /**
   * Detect text (OCR) in an image.
   * @param {string} imageUri - GCS URI or public URL
   * @returns {Promise<object|null>} Text detection results
   */
  async detectText(imageUri) {
    return this.annotateImage(imageUri, [{ type: 'TEXT_DETECTION', maxResults: 50 }]);
  }

  /**
   * Detect labels in an image.
   * @param {string} imageUri - GCS URI or public URL
   * @returns {Promise<object|null>} Label detection results
   */
  async detectLabels(imageUri) {
    return this.annotateImage(imageUri, [{ type: 'LABEL_DETECTION', maxResults: 20 }]);
  }

  /**
   * Detect SafeSearch attributes in an image.
   * @param {string} imageUri - GCS URI or public URL
   * @returns {Promise<object|null>} SafeSearch detection results
   */
  async detectSafeSearch(imageUri) {
    return this.annotateImage(imageUri, [{ type: 'SAFE_SEARCH_DETECTION' }]);
  }
}

export const gcpVisionService = new GcpVisionService();
