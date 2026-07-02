/**
 * Copyright (c) 2026 Inso Code
 *
 * payment.service.js — Stripe Billing & subscription management service.
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
 * Creates a Stripe checkout session for subscription upgrade.
 */
async function createCheckoutSession(userId, planName, successUrl, cancelUrl) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { billing: true },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    // Define price mappings (mock pricing IDs for plan options)
    const priceMapping = {
      launch: 'price_launch_mock',
      build: 'price_build_mock',
      scale: 'price_scale_mock',
    };

    const priceId = priceMapping[planName.toLowerCase()] || priceMapping.launch;

    // Graceful fallback for mock mode if key is missing or is testing mock
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
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      customer_email: user.email,
      metadata: {
        planName,
      },
    });

    return session;
  } catch (err) {
    logger.error('Failed to create Stripe checkout session:', err);
    throw err;
  }
}

/**
 * Handles Stripe webhook events to keep subscription status in sync.
 */
async function handleWebhook(rawBody, signature) {
  let event;

  try {
    if (
      !config.stripe?.stripe_webhook_secret_key ||
      config.stripe.stripe_webhook_secret_key === 'whsec_mock'
    ) {
      // Mock event digestion for local testing/verification
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

    default:
      logger.debug(`Unhandled Stripe event type: ${event.type}`);
  }

  return { received: true };
}

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
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Default to 1 month validity

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
          price: planName === 'scale' ? 99.0 : 49.0,
          planName,
          duration: 'month',
          expiresAt,
          paymentStatus: 'paid',
        },
      }),
    ]);

    logger.info(
      `Successfully activated ${planName} subscription for user [${userId}].`,
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
  createCheckoutSession,
  handleWebhook,
};
