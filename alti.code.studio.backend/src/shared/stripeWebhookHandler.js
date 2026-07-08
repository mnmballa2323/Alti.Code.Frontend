import { logger } from './logger.js';
import { tenantManager } from './tenantManager.js';
import { usageMetering } from './usageMetering.js';
import { auditLogger } from './auditLogger.js';

class StripeWebhookHandler {
  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  async init() {
    logger.info('[StripeWebhookHandler] Initialized');
  }

  async processWebhook(event) {
    logger.info(`[StripeWebhookHandler] Processing event ${event.type}`);

    try {
      switch (event.type) {
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        default:
          logger.info(`[StripeWebhookHandler] Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      logger.error(`[StripeWebhookHandler] Error processing webhook ${event.type}:`, err.message);
      throw err;
    }
  }

  async handlePaymentFailed(invoice) {
    const tenantId = invoice.metadata?.tenantId;
    if (!tenantId) return;

    logger.warn(`[StripeWebhookHandler] Payment failed for tenant ${tenantId}`);
    
    await auditLogger.log({
      action: 'billing.payment_failed',
      actor: { id: 'stripe' },
      resource: { type: 'invoice', id: invoice.id },
      result: 'failure',
      tenantId
    });

    // Tenant suspension if failed for 14 days logic could go here
    // e.g. await tenantManager.suspendIfPastDue(tenantId, invoice);
  }

  async handleSubscriptionUpdated(subscription) {
    const tenantId = subscription.metadata?.tenantId;
    if (!tenantId) return;

    const newPlanId = subscription.items.data[0]?.price.id;
    logger.info(`[StripeWebhookHandler] Subscription updated for tenant ${tenantId}, new plan: ${newPlanId}`);

    // Update plan in tenantManager.js
    // e.g. await tenantManager.updatePlan(tenantId, newPlanId);

    await auditLogger.log({
      action: 'billing.subscription_updated',
      actor: { id: 'stripe' },
      resource: { type: 'subscription', id: subscription.id },
      result: 'success',
      tenantId
    });
  }

  async handlePaymentSucceeded(invoice) {
    const tenantId = invoice.metadata?.tenantId;
    if (!tenantId) return;

    logger.info(`[StripeWebhookHandler] Payment succeeded for tenant ${tenantId}`);

    await auditLogger.log({
      action: 'billing.payment_succeeded',
      actor: { id: 'stripe' },
      resource: { type: 'invoice', id: invoice.id },
      result: 'success',
      tenantId
    });
  }
}

export const stripeWebhookHandler = new StripeWebhookHandler();
