import { logger } from '../../../shared/logger.js';

class GcpEventarcService {
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
      logger.info('✅ GCP Eventarc service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Eventarc init failed: ${e.message}`);
    }
  }

  /**
   * List all Eventarc triggers in the project/region.
   * @returns {Promise<object>} Triggers list
   */
  async listTriggers() {
    if (!this.isInitialized || !this.client) return { triggers: [] };
    try {
      const url = `https://eventarc.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/triggers`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpEventarc.listTriggers failed: ${e.message}`);
      return { triggers: [] };
    }
  }

  /**
   * Create an Eventarc trigger.
   * @param {string} triggerId - Unique trigger identifier
   * @param {object} config - Trigger configuration (eventFilters, destination, transport, etc.)
   * @returns {Promise<object|null>} Created trigger (long-running operation)
   */
  async createTrigger(triggerId, config = {}) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://eventarc.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/triggers?triggerId=${triggerId}`;
      const body = {
        ...config,
        name: `projects/${this.projectId}/locations/${this.region}/triggers/${triggerId}`,
      };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpEventarc: Trigger created: ${triggerId}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpEventarc.createTrigger failed: ${e.message}`);
      return null;
    }
  }

  /**
   * Delete an Eventarc trigger.
   * @param {string} triggerName - Full trigger resource name (projects/{project}/locations/{location}/triggers/{trigger})
   * @returns {Promise<object|null>} Long-running operation
   */
  async deleteTrigger(triggerName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://eventarc.googleapis.com/v1/${triggerName}`;
      const res = await this.client.request({ url, method: 'DELETE' });
      logger.info(`GcpEventarc: Trigger deleted: ${triggerName}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpEventarc.deleteTrigger failed: ${e.message}`);
      return null;
    }
  }

  /**
   * List all Eventarc channels in the project/region.
   * @returns {Promise<object>} Channels list
   */
  async listChannels() {
    if (!this.isInitialized || !this.client) return { channels: [] };
    try {
      const url = `https://eventarc.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/channels`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpEventarc.listChannels failed: ${e.message}`);
      return { channels: [] };
    }
  }
}

export const gcpEventarcService = new GcpEventarcService();
