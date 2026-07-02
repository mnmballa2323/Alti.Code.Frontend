/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * SIEM Webhook Dispatcher
 * Sends critical security events to Splunk, Datadog, or Generic SIEM endpoints.
 */

import axios from 'axios';
import kms from '@google-cloud/kms';
import crypto from 'crypto';
import { prisma } from '../../../config/prisma.js';
import { logger } from '../../../shared/logger.js';
import { complianceEngine } from '../enterprise/compliance.engine.js';

let kmsClient = null;

const signPayload = async (payloadString) => {
  const keyName = process.env.GCP_KMS_KEY_NAME;
  
  if (!keyName) {
    // Local HMAC fallback
    const hmac = crypto.createHmac('sha256', 'mock-gcp-kms-secret');
    return hmac.update(payloadString).digest('base64');
  }

  try {
    if (!kmsClient) {
      const { KeyManagementServiceClient } = kms;
      kmsClient = new KeyManagementServiceClient();
    }

    // Digest the payload first
    const hash = crypto.createHash('sha256').update(payloadString).digest();

    const [response] = await kmsClient.asymmetricSign({
      name: keyName,
      digest: {
        sha256: hash,
      },
    });

    return response.signature.toString('base64');
  } catch (error) {
    logger.warn(`⚠️ [SIEM] GCP KMS asymmetric sign failed, falling back to local HMAC: ${error.message}`);
    const hmac = crypto.createHmac('sha256', 'mock-gcp-kms-secret');
    return hmac.update(payloadString).digest('base64');
  }
};

class SiemService {
  /**
   * Dispatch an event to all configured SIEMs for a given tenant.
   * Non-blocking: We do not await the axios post to prevent slowing down the request.
   */
  async dispatchEvent(tenantId, eventType, details) {
    if (!tenantId) return;

    try {
      const webhooks = await prisma.siemWebhook.findMany({
        where: { tenantId, isActive: true },
      });

      if (webhooks.length === 0) return;

      const payload = {
        timestamp: new Date().toISOString(),
        tenantId,
        eventType,
        source: 'alti-code-studio-waf',
        severity: this.getSeverity(eventType),
        details,
      };

      // Sign the webhook payload cryptographically
      const signature = await signPayload(JSON.stringify(payload));

      for (const webhook of webhooks) {
        const headers = {
          'Content-Type': 'application/json',
          ...(webhook.authToken
            ? { Authorization: `Bearer ${webhook.authToken}` }
            : {}),
          ...(signature ? { 'X-Alti-Signature': signature } : {}),
        };

        // Fire and forget
        axios
          .post(webhook.endpoint, payload, {
            headers,
            timeout: 5000,
          })
          .catch(err => {
            // Do not bubble up error, just log it internally
            logger.error(
              `[SIEM] Failed to dispatch ${eventType} to ${webhook.provider}: ${err.message}`,
            );
          });
      }
    } catch (error) {
      logger.error(`[SIEM] Dispatch failure: ${error.message}`);
    }
  }

  getSeverity(eventType) {
    switch (eventType) {
      case 'WAF_PAYLOAD_INJECTION':
        return 'CRITICAL';
      case 'ABAC_CLEARANCE_DENIED':
        return 'HIGH';
      case 'ABAC_IP_DENIED':
        return 'HIGH';
      case 'WAF_RATE_LIMIT':
        return 'MEDIUM';
      default:
        return 'INFO';
    }
  }
}

export const siemService = new SiemService();
