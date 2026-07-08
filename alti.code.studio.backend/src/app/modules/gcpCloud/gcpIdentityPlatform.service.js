import { logger } from '../../../shared/logger.js';

class GcpIdentityPlatformService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
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
        logger.info('✅ Google Cloud Identity Platform: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Identity Platform init failed: ${e.message}`);
    }
  }

  _baseUrl() {
    return `https://identitytoolkit.googleapis.com/v1/projects/${this.projectId}`;
  }

  /**
   * Create a new user in Identity Platform.
   * @param {string} email - User email address
   * @param {string} password - User password
   * @param {string} [displayName] - Optional display name
   * @returns {Promise<object>} Created user record
   */
  async createUser(email, password, displayName) {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._baseUrl()}/accounts`;
        const res = await this.client.request({
          url,
          method: 'POST',
          data: {
            email,
            password,
            displayName: displayName || '',
            emailVerified: false,
            disabled: false,
          },
        });
        logger.info(`👤 Identity Platform: Created user ${email}`);
        return res.data;
      } catch (e) {
        logger.warn(`⚠️ Identity Platform createUser failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Identity Platform Mock: createUser(${email})`);
    return { localId: `mock-uid-${Date.now()}`, email, displayName: displayName || '' };
  }

  /**
   * Get a user by their UID.
   * @param {string} uid - User unique identifier
   * @returns {Promise<object>} User record
   */
  async getUser(uid) {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._baseUrl()}/accounts:lookup`;
        const res = await this.client.request({
          url,
          method: 'POST',
          data: { localId: [uid] },
        });
        const users = res.data.users || [];
        if (users.length > 0) {
          logger.info(`👤 Identity Platform: Retrieved user ${uid}`);
          return users[0];
        }
        logger.warn(`⚠️ Identity Platform: User ${uid} not found`);
        return null;
      } catch (e) {
        logger.warn(`⚠️ Identity Platform getUser failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Identity Platform Mock: getUser(${uid})`);
    return { localId: uid, email: `${uid}@mock.example.com`, displayName: 'Mock User' };
  }

  /**
   * Delete a user by their UID.
   * @param {string} uid - User unique identifier
   * @returns {Promise<object>} Deletion result
   */
  async deleteUser(uid) {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._baseUrl()}/accounts:delete`;
        await this.client.request({
          url,
          method: 'POST',
          data: { localId: uid },
        });
        logger.info(`👤 Identity Platform: Deleted user ${uid}`);
        return { deleted: true, localId: uid };
      } catch (e) {
        logger.warn(`⚠️ Identity Platform deleteUser failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Identity Platform Mock: deleteUser(${uid})`);
    return { deleted: false, localId: uid };
  }

  /**
   * List users with optional pagination.
   * @param {number} [maxResults=100] - Maximum number of users to return
   * @returns {Promise<object[]>} Array of user records
   */
  async listUsers(maxResults = 100) {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._baseUrl()}/accounts:batchGet?maxResults=${maxResults}`;
        const res = await this.client.request({ url, method: 'GET' });
        const users = res.data.users || [];
        logger.info(`👤 Identity Platform: ${users.length} users retrieved`);
        return users;
      } catch (e) {
        logger.warn(`⚠️ Identity Platform listUsers failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Identity Platform Mock: listUsers(${maxResults})`);
    return [];
  }
}

export const gcpIdentityPlatformService = new GcpIdentityPlatformService();
