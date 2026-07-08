/**
 * Copyright (c) 2026 Inso Code
 *
 * payment.service.js — Stripe Billing & subscription management service.
 * Supports Credit Card and ACH Bank Debit for monthly SaaS billing.
 */

import Stripe from 'stripe';
import { prismaClient } from '../../platform/db/prismaClient.js';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

const prisma = prismaClient.prisma;
const stripe = new Stripe(config.stripe?.stripe_secret_key || 'sk_test_mock', {
  apiVersion: '2022-11-15',
});

/**
 * Plan pricing configuration.
 * Maps backend plan names to Stripe Price IDs and display amounts.
 * Replace the price IDs with your actual Stripe Price IDs from the Stripe Dashboard.
 */
const PLAN_CONFIG = {
  launch: {
    stripePriceId: process.env.STRIPE_PRICE_LAUNCH || 'price_launch_placeholder',
    displayName: 'Cloud',
    amountCents: 100000, // $1,000/mo
  },
  build: {
    stripePriceId: process.env.STRIPE_PRICE_BUILD || 'price_build_placeholder',
    displayName: 'Dedicated',
    amountCents: 250000, // $2,500/mo
  },
  scale: {
    stripePriceId: process.env.STRIPE_PRICE_SCALE || 'price_scale_placeholder',
    displayName: 'Sovereign',
    amountCents: 500000, // $5,000/mo
  },
};

// ─── Customer Management ─────────────────────────────────────────────────────

/**
 * Creates or retrieves a Stripe Customer for the given user.
 * Ensures idempotency: if a stripeCustomerId already exists in the billing
 * record, it returns that. Otherwise, it creates a new Stripe Customer and
 * persists the ID.
 */
async function createOrGetStripeCustomer(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { billing: true },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    // If customer already exists in Stripe, return it
    if (user.billing?.stripeCustomerId) {
      logger.info(
        `Stripe customer already exists for user [${userId}]: ${user.billing.stripeCustomerId}`,
      );
      return user.billing.stripeCustomerId;
    }

    // Mock mode fallback
    if (
      !config.stripe?.stripe_secret_key ||
      config.stripe.stripe_secret_key === 'sk_test_mock'
    ) {
      const mockCustomerId =
        'cus_mock_' + Math.random().toString(36).substring(2, 15);
      logger.warn(
        `⚠️ Stripe secret key missing or mock. Returning mock customer: ${mockCustomerId}`,
      );

      await prisma.userBilling.upsert({
        where: { userId },
        update: { stripeCustomerId: mockCustomerId },
        create: {
          userId,
          stripeCustomerId: mockCustomerId,
          activePlan: user.subscriptionPlan || 'launch',
          tokenBalance: 0,
        },
      });

      return mockCustomerId;
    }

    // Create a real Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      metadata: {
        userId: userId,
        plan: user.subscriptionPlan || 'launch',
      },
    });

    // Persist the Stripe Customer ID
    await prisma.userBilling.upsert({
      where: { userId },
      update: { stripeCustomerId: customer.id },
      create: {
        userId,
        stripeCustomerId: customer.id,
        activePlan: user.subscriptionPlan || 'launch',
        tokenBalance: 0,
      },
    });

    logger.info(
      `Created Stripe customer [${customer.id}] for user [${userId}].`,
    );
    return customer.id;
  } catch (err) {
    logger.error(`Failed to create/get Stripe customer for user [${userId}]:`, err);
    throw err;
  }
}

// ─── SetupIntent (Save Payment Method) ───────────────────────────────────────

/**
 * Creates a Stripe SetupIntent for securely collecting a payment method
 * (credit card or ACH bank account) without charging the user immediately.
 * Used on the Billing page to save/update payment methods.
 */
async function createSetupIntent(userId, paymentMethodType = 'card') {
  try {
    const customerId = await createOrGetStripeCustomer(userId);

    // Mock mode fallback
    if (
      !config.stripe?.stripe_secret_key ||
      config.stripe.stripe_secret_key === 'sk_test_mock'
    ) {
      logger.warn('⚠️ Stripe secret key missing or mock. Returning mock SetupIntent.');
      return {
        id: 'seti_mock_' + Math.random().toString(36).substring(2, 15),
        client_secret: 'seti_mock_secret_' + Math.random().toString(36).substring(2, 15),
        customer: customerId,
      };
    }

    const paymentMethodTypes =
      paymentMethodType === 'us_bank_account'
        ? ['us_bank_account']
        : ['card'];

    const setupIntentParams = {
      customer: customerId,
      payment_method_types: paymentMethodTypes,
      metadata: {
        userId,
      },
    };

    // ACH requires additional mandate data for recurring billing
    if (paymentMethodType === 'us_bank_account') {
      setupIntentParams.payment_method_options = {
        us_bank_account: {
          financial_connections: {
            permissions: ['payment_method', 'balances'],
          },
          verification_method: 'instant',
        },
      };
    }

    const setupIntent = await stripe.setupIntents.create(setupIntentParams);

    logger.info(
      `Created SetupIntent [${setupIntent.id}] for user [${userId}] (type: ${paymentMethodType}).`,
    );

    return {
      id: setupIntent.id,
      client_secret: setupIntent.client_secret,
      customer: customerId,
    };
  } catch (err) {
    logger.error(`Failed to create SetupIntent for user [${userId}]:`, err);
    throw err;
  }
}

// ─── Checkout Session (Plan Selection) ───────────────────────────────────────

/**
 * Creates a Stripe Checkout Session for subscription upgrade.
 * Supports both credit card and ACH bank debit payment methods.
 */
async function createCheckoutSession(userId, planName, successUrl, cancelUrl) {
  try {
    const customerId = await createOrGetStripeCustomer(userId);
    const plan = PLAN_CONFIG[planName.toLowerCase()] || PLAN_CONFIG.launch;

    // Mock mode fallback
    if (
      !config.stripe?.stripe_secret_key ||
      config.stripe.stripe_secret_key === 'sk_test_mock'
    ) {
      logger.warn(
        '⚠️ Stripe secret key missing or mock. Simulating checkout session.',
      );
      return {
        id: 'cs_mock_' + Math.random().toString(36).substring(2, 15),
        url: `${successUrl}?session_id=mock_session`,
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      client_reference_id: userId,
      metadata: {
        planName,
      },
      payment_method_options: {
        us_bank_account: {
          financial_connections: {
            permissions: ['payment_method'],
          },
          verification_method: 'instant',
        },
      },
    });

    return session;
  } catch (err) {
    logger.error('Failed to create Stripe checkout session:', err);
    throw err;
  }
}

// ─── Webhook Handler ─────────────────────────────────────────────────────────

/**
 * Handles Stripe webhook events to keep subscription status in sync.
 * Covers checkout completion, subscription lifecycle, SetupIntent results,
 * and invoice payment outcomes for recurring billing.
 */
async function handleWebhook(rawBody, signature) {
  let event;

  try {
    if (
      !config.stripe?.stripe_webhook_secret_key ||
      config.stripe.stripe_webhook_secret_key === 'whsec_mock'
    ) {
      logger.warn(
        '⚠️ Stripe webhook secret missing. Parsing payload directly.',
      );
      event = JSON.parse(rawBody);
    } else {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.stripe_webhook_secret_key,
      );
    }
  } catch (err) {
    logger.error('Stripe webhook signature verification failed:', err);
    throw new Error(`Webhook Error: ${err.message}`);
  }

  logger.info(`Stripe Webhook Event Received: ${event.type}`);

  switch (event.type) {
    // ── Checkout Flow ──
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const stripeCustomerId = session.customer;
      const planName = session.metadata?.planName || 'launch';

      if (!userId) {
        logger.error(
          'No client_reference_id (userId) found in checkout session completion.',
        );
        break;
      }

      await activateUserSubscription(
        userId,
        stripeCustomerId,
        planName,
        session.id,
      );
      break;
    }

    // ── Subscription Lifecycle ──
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer;

      await deactivateUserSubscription(stripeCustomerId);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const stripeCustomerId = subscription.customer;
      const planName = subscription.metadata?.planName || 'launch';
      const status = subscription.status;

      if (status === 'active') {
        await updateUserSubscriptionPlan(stripeCustomerId, planName);
      } else if (status === 'unpaid' || status === 'canceled') {
        await deactivateUserSubscription(stripeCustomerId);
      }
      break;
    }

    // ── SetupIntent (Payment Method Saved from Billing Page) ──
    case 'setup_intent.succeeded': {
      const setupIntent = event.data.object;
      const userId = setupIntent.metadata?.userId;
      const customerId = setupIntent.customer;
      const paymentMethodId = setupIntent.payment_method;

      if (customerId && paymentMethodId) {
        try {
          // Set as default payment method for future invoices
          await stripe.customers.update(customerId, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });
          logger.info(
            `Set payment method [${paymentMethodId}] as default for customer [${customerId}].`,
          );
        } catch (err) {
          logger.error(
            `Failed to set default payment method for customer [${customerId}]:`,
            err,
          );
        }
      }
      break;
    }

    // ── Invoice Events (Recurring Billing) ──
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const amountPaid = invoice.amount_paid;

      logger.info(
        `Invoice payment succeeded for customer [${customerId}]. Amount: $${(amountPaid / 100).toFixed(2)}.`,
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const attemptCount = invoice.attempt_count;

      logger.warn(
        `Invoice payment FAILED for customer [${customerId}]. Attempt #${attemptCount}.`,
      );

      // After 3 failed attempts, deactivate
      if (attemptCount >= 3) {
        logger.error(
          `Customer [${customerId}] has exceeded max payment retries. Deactivating subscription.`,
        );
        await deactivateUserSubscription(customerId);
      }
      break;
    }

    default:
      logger.debug(`Unhandled Stripe event type: ${event.type}`);
  }

  return { received: true };
}

// ─── Subscription Persistence ────────────────────────────────────────────────

/**
 * Persists the user subscription state to PostgreSQL via Prisma.
 */
async function activateUserSubscription(
  userId,
  stripeCustomerId,
  planName,
  transactionId,
) {
  try {
    const plan = PLAN_CONFIG[planName.toLowerCase()] || PLAN_CONFIG.launch;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month validity

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          isSubscribed: true,
          subscriptionPlan: planName,
          subscriptionDur: 'month',
          subscriptionStat: 'paid',
          subscriptionExp: expiresAt,
        },
      }),
      prisma.userBilling.upsert({
        where: { userId },
        update: {
          stripeCustomerId,
          activePlan: planName,
          tokenBalance: { increment: 100000 }, // Pre-populate 100k tokens on upgrade
        },
        create: {
          userId,
          stripeCustomerId,
          activePlan: planName,
          tokenBalance: 100000,
        },
      }),
      prisma.subscription.create({
        data: {
          userId,
          transactionId,
          price: plan.amountCents / 100, // Store as dollars
          planName,
          duration: 'month',
          expiresAt,
          paymentStatus: 'paid',
        },
      }),
    ]);

    logger.info(
      `Successfully activated ${plan.displayName} (${planName}) subscription for user [${userId}].`,
    );
  } catch (err) {
    logger.error(
      `Database error activating subscription for user [${userId}]:`,
      err,
    );
  }
}

/**
 * Revokes user subscription access.
 */
async function deactivateUserSubscription(stripeCustomerId) {
  try {
    const billing = await prisma.userBilling.findFirst({
      where: { stripeCustomerId },
    });

    if (!billing) {
      logger.warn(
        `No billing profile found for Stripe Customer ID: ${stripeCustomerId}`,
      );
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: billing.userId },
        data: {
          isSubscribed: false,
          subscriptionStat: 'expired',
          subscriptionPlan: 'free',
        },
      }),
      prisma.userBilling.update({
        where: { userId: billing.userId },
        data: {
          activePlan: 'free',
        },
      }),
    ]);

    logger.info(
      `Successfully deactivated subscription for user [${billing.userId}].`,
    );
  } catch (err) {
    logger.error(
      `Database error deactivating subscription for customer [${stripeCustomerId}]:`,
      err,
    );
  }
}

/**
 * Updates user subscription plan details.
 */
async function updateUserSubscriptionPlan(stripeCustomerId, planName) {
  try {
    const billing = await prisma.userBilling.findFirst({
      where: { stripeCustomerId },
    });

    if (!billing) {
      logger.warn(
        `No billing profile found for Stripe Customer ID: ${stripeCustomerId}`,
      );
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: billing.userId },
        data: {
          subscriptionPlan: planName,
        },
      }),
      prisma.userBilling.update({
        where: { userId: billing.userId },
        data: {
          activePlan: planName,
        },
      }),
    ]);

    logger.info(
      `Successfully updated subscription plan to ${planName} for user [${billing.userId}].`,
    );
  } catch (err) {
    logger.error(
      `Database error updating subscription plan for customer [${stripeCustomerId}]:`,
      err,
    );
  }
}

export const PaymentService = {
  createOrGetStripeCustomer,
  createSetupIntent,
  createCheckoutSession,
  handleWebhook,
};
