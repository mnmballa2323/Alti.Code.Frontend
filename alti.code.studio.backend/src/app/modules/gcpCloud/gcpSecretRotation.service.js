import { logger } from '../../../shared/logger.js';

class GcpSecretRotationService {
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
      logger.info('✅ GCP Secret Rotation service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Secret Rotation init failed: ${e.message}`);
    }
  }

  /**
   * Enable auto-rotation on a secret.
   * @param {string} secretName - Full secret resource name (projects/{project}/secrets/{secret})
   * @param {string} rotationPeriod - Rotation period (e.g., '2592000s' for 30 days)
   * @param {string} [nextRotation] - Next rotation timestamp in RFC 3339 format
   * @returns {Promise<object|null>} Updated secret with rotation config
   */
  async enableAutoRotation(secretName, rotationPeriod, nextRotation) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://secretmanager.googleapis.com/v1/${secretName}?updateMask=rotation`;
      const body = {
        rotation: {
          rotationPeriod,
          ...(nextRotation && { nextRotationTime: nextRotation }),
        },
      };
      const res = await this.client.request({ url, method: 'PATCH', data: body });
      logger.info(`GcpSecretRotation: Auto-rotation enabled for ${secretName} (period: ${rotationPeriod})`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpSecretRotation.enableAutoRotation failed: ${e.message}`);
      return null;
    }
  }

  /**
   * Disable auto-rotation on a secret by clearing the rotation config.
   * @param {string} secretName - Full secret resource name
   * @returns {Promise<object|null>} Updated secret without rotation config
   */
  async disableAutoRotation(secretName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://secretmanager.googleapis.com/v1/${secretName}?updateMask=rotation`;
      const body = { rotation: {} };
      const res = await this.client.request({ url, method: 'PATCH', data: body });
      logger.info(`GcpSecretRotation: Auto-rotation disabled for ${secretName}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpSecretRotation.disableAutoRotation failed: ${e.message}`);
      return null;
    }
  }

  /**
   * List all versions of a secret.
   * @param {string} secretName - Full secret resource name
   * @returns {Promise<object>} Secret versions list
   */
  async listSecretVersions(secretName) {
    if (!this.isInitialized || !this.client) return { versions: [] };
    try {
      const url = `https://secretmanager.googleapis.com/v1/${secretName}/versions`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpSecretRotation.listSecretVersions failed: ${e.message}`);
      return { versions: [] };
    }
  }

  /**
   * Get the rotation status and config of a secret.
   * @param {string} secretName - Full secret resource name
   * @returns {Promise<object|null>} Secret metadata including rotation info
   */
  async getRotationStatus(secretName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://secretmanager.googleapis.com/v1/${secretName}`;
      const res = await this.client.request({ url });
      const secret = res.data;
      return {
        name: secret.name,
        rotation: secret.rotation || null,
        createTime: secret.createTime,
        nextRotationTime: secret.rotation?.nextRotationTime || null,
        rotationPeriod: secret.rotation?.rotationPeriod || null,
        topics: secret.topics || [],
      };
    } catch (e) {
      logger.warn(`GcpSecretRotation.getRotationStatus failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpSecretRotationService = new GcpSecretRotationService();
