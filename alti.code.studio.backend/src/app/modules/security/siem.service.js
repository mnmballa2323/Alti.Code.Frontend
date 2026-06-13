/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * SIEM Webhook Dispatcher
 * Sends critical security events to Splunk, Datadog, or Generic SIEM endpoints.
 */

import axios from 'axios';
import { prisma } from '../../../config/prisma.js';
import { logger } from '../../../shared/logger.js';

class SiemService {
    
    /**
     * Dispatch an event to all configured SIEMs for a given tenant.
     * Non-blocking: We do not await the axios post to prevent slowing down the request.
     */
    async dispatchEvent(tenantId, eventType, details) {
        if (!tenantId) return;

        try {
            const webhooks = await prisma.siemWebhook.findMany({
                where: { tenantId, isActive: true }
            });

            if (webhooks.length === 0) return;

            const payload = {
                timestamp: new Date().toISOString(),
                tenantId,
                eventType,
                source: 'alti-code-studio-waf',
                severity: this.getSeverity(eventType),
                details
            };

            for (const webhook of webhooks) {
                // Fire and forget
                axios.post(webhook.endpoint, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(webhook.authToken ? { 'Authorization': `Bearer ${webhook.authToken}` } : {})
                    },
                    timeout: 5000
                }).catch(err => {
                    // Do not bubble up error, just log it internally
                    logger.error(`[SIEM] Failed to dispatch ${eventType} to ${webhook.provider}: ${err.message}`);
                });
            }
        } catch (error) {
            logger.error(`[SIEM] Dispatch failure: ${error.message}`);
        }
    }

    getSeverity(eventType) {
        switch (eventType) {
            case 'WAF_PAYLOAD_INJECTION': return 'CRITICAL';
            case 'ABAC_CLEARANCE_DENIED': return 'HIGH';
            case 'ABAC_IP_DENIED': return 'HIGH';
            case 'WAF_RATE_LIMIT': return 'MEDIUM';
            default: return 'INFO';
        }
    }
}

export const siemService = new SiemService();
