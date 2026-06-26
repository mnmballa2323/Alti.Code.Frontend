/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';

class WebhookService {
  /**
   * Send a signed webhook to an external URL
   * @param {string} url
   * @param {Object} payload
   * @param {string} secret
   */
  async sendWebhook(url, payload, secret) {
    try {
      const body = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      logger.info(`🤝 The Diplomat: Sending webhook to ${url}...`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': `sha256=${signature}`,
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      logger.info('✅ Webhook sent successfully.');
      return true;
    } catch (error) {
      logger.error(`❌ Webhook Delivery Failed: ${error.message}`);
      return false; // Don't throw, just log failure for now (retries would be in BullMQ)
    }
  }

  /**
   * Verify an incoming webhook signature
   * @param {string} payloadBody (Raw string)
   * @param {string} signatureHeader
   * @param {string} secret
   */
  verifySignature(payloadBody, signatureHeader, secret) {
    if (!signatureHeader) return false;

    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadBody)
      .digest('hex');

    const expected = `sha256=${signature}`;

    // Constant time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected),
    );
  }
}

export const webhookService = new WebhookService();
