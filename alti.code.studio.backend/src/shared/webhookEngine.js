/**
 * Webhook Delivery Engine
 * 
 * Production webhook system:
 * - Event subscription management
 * - Reliable delivery with exponential backoff
 * - HMAC-SHA256 payload signing
 * - Delivery tracking and retry
 * - Dead letter queue for failed deliveries
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';
import crypto from 'crypto';

const WEBHOOK_EVENTS = [
  'agent.started', 'agent.completed', 'agent.failed',
  'session.created', 'session.ended',
  'user.created', 'user.updated', 'user.deleted',
  'org.plan_changed', 'org.usage_threshold',
  'deployment.started', 'deployment.completed', 'deployment.failed',
  'security.alert', 'security.audit_finding',
];

class WebhookEngine {
  constructor() {
    this.subscriptions = new Map(); // tenantId -> [{ url, events, secret }]
    this.deliveryLog = [];
    this.maxRetries = 3;
    this.maxLogSize = 5000;
  }

  subscribe(tenantId, config) {
    const { url, events = ['*'], secret } = config;
    const signingSecret = secret || crypto.randomBytes(32).toString('hex');
    const subscription = {
      id: crypto.randomUUID(),
      url,
      events: events.includes('*') ? WEBHOOK_EVENTS : events.filter(e => WEBHOOK_EVENTS.includes(e)),
      secret: signingSecret,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const existing = this.subscriptions.get(tenantId) || [];
    existing.push(subscription);
    this.subscriptions.set(tenantId, existing);

    logger.info(`[Webhook] Subscription created for tenant ${tenantId}: ${subscription.id}`);
    return { id: subscription.id, signingSecret };
  }

  unsubscribe(tenantId, subscriptionId) {
    const subs = this.subscriptions.get(tenantId) || [];
    const filtered = subs.filter(s => s.id !== subscriptionId);
    this.subscriptions.set(tenantId, filtered);
    logger.info(`[Webhook] Subscription ${subscriptionId} removed for tenant ${tenantId}`);
  }

  async emit(tenantId, event, payload) {
    const subs = this.subscriptions.get(tenantId) || [];
    const matching = subs.filter(s => s.active && s.events.includes(event));

    if (matching.length === 0) return;

    const deliveryPromises = matching.map(sub => this._deliver(tenantId, sub, event, payload));
    await Promise.allSettled(deliveryPromises);
  }

  async _deliver(tenantId, subscription, event, payload, attempt = 1) {
    const deliveryId = crypto.randomUUID();
    const body = JSON.stringify({
      id: deliveryId,
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const signature = this._sign(body, subscription.secret);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-ID': deliveryId,
          'X-Webhook-Event': event,
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Timestamp': new Date().toISOString(),
          'User-Agent': 'AltiCodeStudio-Webhook/1.0',
        },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const status = res.ok ? 'delivered' : 'failed';
      this._logDelivery({ deliveryId, tenantId, event, subscriptionId: subscription.id, status, httpStatus: res.status, attempt });

      if (!res.ok && attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => this._deliver(tenantId, subscription, event, payload, attempt + 1), delay);
      }

      metrics.incrementCounter('webhook_deliveries', 1, { event, status });
    } catch (err) {
      this._logDelivery({ deliveryId, tenantId, event, subscriptionId: subscription.id, status: 'error', error: err.message, attempt });

      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => this._deliver(tenantId, subscription, event, payload, attempt + 1), delay);
      } else {
        metrics.incrementCounter('webhook_dead_letter', 1, { event });
        logger.error(`[Webhook] Dead letter: ${event} to ${subscription.url} after ${this.maxRetries} attempts`);
      }
    }
  }

  _sign(payload, secret) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  _logDelivery(entry) {
    this.deliveryLog.push({ ...entry, timestamp: new Date().toISOString() });
    if (this.deliveryLog.length > this.maxLogSize) {
      this.deliveryLog = this.deliveryLog.slice(-this.maxLogSize);
    }
  }

  getDeliveryLog(tenantId, limit = 50) {
    return this.deliveryLog.filter(d => d.tenantId === tenantId).slice(-limit);
  }

  getSubscriptions(tenantId) {
    return this.subscriptions.get(tenantId) || [];
  }

  getSupportedEvents() {
    return WEBHOOK_EVENTS;
  }
}

export const webhookEngine = new WebhookEngine();
