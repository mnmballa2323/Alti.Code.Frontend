/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * SIEM Webhook Dispatcher
 * Sends critical security events to Splunk, Datadog, or Generic SIEM endpoints.
 */

import axios from 'axios';
import { prisma } from '../../../config/prisma.js';
import { logger } from '../../../shared/logger.js';
import { complianceEngine } from '../enterprise/compliance.engine.js';

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

      // Sign the webhook payload if Azure Key Vault is configured
      let signature = null;
      const isKeyVaultConfigured =
        process.env.AZURE_KEYVAULT_ENDPOINT || process.env.AZURE_KEYVAULT_URL;
      if (isKeyVaultConfigured) {
        try {
          signature = await complianceEngine._signWithAzureKeyVault(
            JSON.stringify(payload),
          );
        } catch (err) {
          logger.warn(
            `⚠️ Azure Key Vault Signing for SIEM failed (${err.message}). Falling back to local mock signature.`,
          );
          const crypto = await import('crypto');
          signature = crypto
            .createHmac('sha256', 'mock-azure-keyvault-secret')
            .update(JSON.stringify(payload))
            .digest('base64');
        }
      }

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
