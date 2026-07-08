import { logger } from '../../../shared/logger.js';

class GcpAccessApprovalService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID) {
        const { AccessApprovalClient } = await import('@google-cloud/access-approval');
        this.client = new AccessApprovalClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Access Approval: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Access Approval init failed: ${e.message}`);
    }
  }

  /**
   * List pending and recent approval requests for the project.
   * @returns {Promise<object[]>} Array of approval requests
   */
  async listApprovalRequests() {
    if (this.isInitialized && this.client) {
      try {
        const projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
        const parent = `projects/${projectId}`;

        const [requests] = await this.client.listApprovalRequests({
          parent,
        });

        logger.info(`🛂 Access Approval: ${requests.length} approval requests for ${parent}`);
        return requests;
      } catch (e) {
        logger.error(`❌ Access Approval listApprovalRequests failed: ${e.message}`);
      }
    }

    logger.info(`🛂 Access Approval Mock: listApprovalRequests()`);
    return [];
  }

  /**
   * Approve a pending access request from Google support.
   * @param {string} requestName - Fully qualified approval request name
   * @returns {Promise<object>} Approved request
   */
  async approveRequest(requestName) {
    if (this.isInitialized && this.client) {
      try {
        const expireTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

        const [approvedRequest] = await this.client.approveApprovalRequest({
          name: requestName,
          expireTime: {
            seconds: Math.floor(expireTime.getTime() / 1000),
          },
        });

        logger.info(`✅ Access Approval: Approved request ${requestName}`);
        return approvedRequest;
      } catch (e) {
        logger.error(`❌ Access Approval approveRequest failed: ${e.message}`);
      }
    }

    logger.info(`✅ Access Approval Mock: approveRequest(${requestName})`);
    return { name: requestName, approved: false };
  }

  /**
   * Dismiss a pending access request (deny without approving).
   * @param {string} requestName - Fully qualified approval request name
   * @returns {Promise<object>} Dismissed request
   */
  async dismissRequest(requestName) {
    if (this.isInitialized && this.client) {
      try {
        const [dismissedRequest] = await this.client.dismissApprovalRequest({
          name: requestName,
        });

        logger.info(`🚫 Access Approval: Dismissed request ${requestName}`);
        return dismissedRequest;
      } catch (e) {
        logger.error(`❌ Access Approval dismissRequest failed: ${e.message}`);
      }
    }

    logger.info(`🚫 Access Approval Mock: dismissRequest(${requestName})`);
    return { name: requestName, dismissed: false };
  }
}

export const gcpAccessApprovalService = new GcpAccessApprovalService();
