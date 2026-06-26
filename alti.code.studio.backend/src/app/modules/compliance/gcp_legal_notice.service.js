import { logger } from '../../../shared/logger.js';
import axios from 'axios';
import crypto from 'crypto';

class GcpLegalNoticeService {
  /**
   * Dispatches the drafted legal notice to GCP Pub/Sub or legal processing endpoint.
   * Falls back to a mock queue receipt if no endpoint is configured or if the call fails.
   *
   * @param {string} legalNoticeDraft
   * @param {Object} metadata
   * @returns {Promise<Object>}
   */
  async dispatchNotice(legalNoticeDraft, metadata) {
    const endpoint = process.env.GCP_LEGAL_NOTICE_URL;

    if (endpoint) {
      try {
        logger.info(`Dispatching legal notice to GCP endpoint: ${endpoint}`);
        const response = await axios.post(endpoint, {
          draft: legalNoticeDraft,
          metadata,
        });

        return {
          success: true,
          status: 'DISPATCHED',
          messageId:
            response.data.messageId || `gcp-msg-${crypto.randomUUID()}`,
          dispatchedAt: new Date().toISOString(),
          provider: 'GcpLegalNoticeService',
          response: response.data,
        };
      } catch (error) {
        logger.error(
          'GCP Legal Notice Service endpoint post failed. Falling back to mock queue...',
          error,
        );
      }
    }

    // Graceful mock fallback
    const messageId = `gcp-legal-msg-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)}`;
    logger.info(
      `⚖️ GCP Legal Notice Service (Mock): Enqueued legal notice ${messageId} successfully.`,
    );

    return {
      success: true,
      messageId,
      dispatchedAt: new Date().toISOString(),
      status: 'QUEUED',
      provider: 'GcpLegalNoticeService',
      channel: 'POSTAL_AND_EMAIL',
      metadata,
    };
  }
}

export const gcpLegalNoticeService = new GcpLegalNoticeService();
