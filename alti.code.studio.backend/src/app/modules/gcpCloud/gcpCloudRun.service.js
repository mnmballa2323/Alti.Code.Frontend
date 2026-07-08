import { logger } from '../../../shared/logger.js';

class GcpCloudRunService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
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
        this.isInitialized = true;
        logger.info('✅ Google Cloud Run: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Run init failed: ${e.message}`);
    }
  }

  _baseUrl(region) {
    const r = region || this.region;
    return `https://run.googleapis.com/v2/projects/${this.projectId}/locations/${r}`;
  }

  /**
   * List all Cloud Run services in a region.
   * @param {string} [region] - GCP region (defaults to GCP_REGION env)
   * @returns {Promise<object[]>} Array of Cloud Run services
   */
  async listServices(region) {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._baseUrl(region)}/services`;
        const res = await this.client.request({ url, method: 'GET' });
        const services = res.data.services || [];
        logger.info(`🚀 Cloud Run: ${services.length} services in ${region || this.region}`);
        return services;
      } catch (e) {
        logger.warn(`⚠️ Cloud Run listServices failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Run Mock: listServices(${region || this.region})`);
    return [];
  }

  /**
   * Get details for a specific Cloud Run service.
   * @param {string} serviceName - Short service name or fully qualified resource name
   * @returns {Promise<object>} Service details
   */
  async getService(serviceName) {
    if (this.isInitialized && this.client) {
      try {
        const url = serviceName.startsWith('projects/')
          ? `https://run.googleapis.com/v2/${serviceName}`
          : `${this._baseUrl()}/services/${serviceName}`;
        const res = await this.client.request({ url, method: 'GET' });
        logger.info(`🚀 Cloud Run: Retrieved service ${serviceName}`);
        return res.data;
      } catch (e) {
        logger.warn(`⚠️ Cloud Run getService failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Run Mock: getService(${serviceName})`);
    return {
      name: `projects/${this.projectId}/locations/${this.region}/services/${serviceName}`,
      uri: `https://${serviceName}-mock.a.run.app`,
      latestReadyRevision: `${serviceName}-00001-abc`,
    };
  }

  /**
   * Get details for a specific revision.
   * @param {string} revisionName - Fully qualified revision resource name
   * @returns {Promise<object>} Revision details
   */
  async getRevision(revisionName) {
    if (this.isInitialized && this.client) {
      try {
        const url = revisionName.startsWith('projects/')
          ? `https://run.googleapis.com/v2/${revisionName}`
          : `${this._baseUrl()}/services/-/revisions/${revisionName}`;
        const res = await this.client.request({ url, method: 'GET' });
        logger.info(`🚀 Cloud Run: Retrieved revision ${revisionName}`);
        return res.data;
      } catch (e) {
        logger.warn(`⚠️ Cloud Run getRevision failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Run Mock: getRevision(${revisionName})`);
    return { name: revisionName, containers: [], scaling: {} };
  }

  /**
   * List all revisions for a Cloud Run service.
   * @param {string} serviceName - Short service name or fully qualified resource name
   * @returns {Promise<object[]>} Array of revisions
   */
  async listRevisions(serviceName) {
    if (this.isInitialized && this.client) {
      try {
        const parent = serviceName.startsWith('projects/')
          ? serviceName
          : `${this._baseUrl()}/services/${serviceName}`;
        const url = `https://run.googleapis.com/v2/${parent}/revisions`;
        const res = await this.client.request({ url, method: 'GET' });
        const revisions = res.data.revisions || [];
        logger.info(`🚀 Cloud Run: ${revisions.length} revisions for ${serviceName}`);
        return revisions;
      } catch (e) {
        logger.warn(`⚠️ Cloud Run listRevisions failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Run Mock: listRevisions(${serviceName})`);
    return [];
  }
}

export const gcpCloudRunService = new GcpCloudRunService();
