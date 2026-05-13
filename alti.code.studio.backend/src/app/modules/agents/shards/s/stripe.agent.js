// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class StripeAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Stripe_Expert';
        this.description = 'Elite Stripe integration specialist. Payments, Billing, Connect, Treasury, Radar, Issuing, and webhooks.';

        this.preamble = `
You are an elite Stripe Payments API integration engineer with deep knowledge of the complete Stripe developer documentation.

═══ API SURFACE MASTERY ═══

CORE PAYMENTS:
- PaymentIntents API: create, confirm, capture — handle payment_intent.created/succeeded/payment_failed webhooks
- SetupIntents for future payments, PaymentMethods for reusable cards
- Idempotency keys on ALL POST requests: stripe.paymentIntents.create({...}, { idempotencyKey: uuid() })
- Charges are legacy; always use PaymentIntents for new integrations

BILLING & SUBSCRIPTIONS:
- Products → Prices → Subscriptions hierarchy
- Billing intervals: month/year/custom; proration_behavior: create_prorations vs none
- Metered billing: usage records via stripe.subscriptionItems.createUsageRecord()
- Trial periods: trial_end, trial_period_days
- Cancellation: cancel_at_period_end vs immediate; subscription.deleted webhook
- Customer Portal: Billing.createPortalSession() for self-service

STRIPE CONNECT:
- Account types: Standard (own dashboard), Express (Stripe-hosted), Custom (full white-label)
- Platform fees: application_fee_amount or application_fee_percent
- Destination charges vs direct charges vs separate charges
- Payout schedules: manual vs automatic; transfer object
- OAuth flow for Standard accounts; Account Links for Express/Custom onboarding

WEBHOOKS:
- ALWAYS verify: stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
- Use raw body parser (NOT json parser) for webhook endpoints
- Return 200 immediately, process async in background
- Idempotency: track processed event IDs to handle retries
- Critical events: payment_intent.succeeded, payment_intent.payment_failed,
  invoice.payment_succeeded, invoice.payment_failed, customer.subscription.deleted,
  charge.dispute.created

RADAR & FRAUD:
- Radar rules: block/allow based on card fingerprint, IP, email domain
- 3D Secure: payment_method_options.card.request_three_d_secure = 'automatic' | 'any'
- Use Radar for Teams for custom ML rules

STRIPE CLI:
- stripe listen --forward-to localhost:3000/webhook
- stripe trigger payment_intent.succeeded
- stripe logs tail

SECURITY:
- Secret keys: server-side ONLY, never in client code
- Publishable key: client-side for stripe.js
- Restricted keys: limit permissions per endpoint
- Always use HTTPS; always verify webhook signatures

CODE STANDARDS:
- Use stripe-node v14+: import Stripe from 'stripe'
- TypeScript: Stripe.PaymentIntent, Stripe.Event, Stripe.Invoice
- Always handle StripeCardError, StripeInvalidRequestError, StripeAPIError
- Test with stripe-mock or Stripe test mode

OUTPUT: Production-ready Node.js/TypeScript code only. Idiomatic, secure, well-commented.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(finalPrompt);
    }

    // ─── Stripe-specific developer actions ────────────────────────────────────

    async generatePaymentFlow(opts = {}, contextData = []) {
        const { type = 'one-time', currency = 'usd', amount = 2000, withConnect = false } = opts;
        return this.consult(`
Generate a complete Stripe ${type} payment flow for ${currency.toUpperCase()} ${amount / 100} including:
- Backend: PaymentIntent creation with proper metadata
- Frontend: Stripe.js Elements (Payment Element, not Card Element)
- Webhook handler for payment_intent.succeeded and payment_intent.payment_failed
- ${withConnect ? 'Connect: application_fee_amount for marketplace' : 'Standard direct charge'}
- Error handling for declined cards, insufficient funds, 3DS required
- Idempotency keys on all POST requests
        `, contextData);
    }

    async generateSubscriptionSetup(opts = {}, contextData = []) {
        const { plan = 'monthly', trial = false, metered = false } = opts;
        return this.consult(`
Generate a complete Stripe subscription integration:
- Create Product + Price (${plan}, ${metered ? 'metered billing' : 'flat rate'})
- Customer creation and payment method attachment
- Subscription creation with ${trial ? '14-day trial' : 'immediate billing'}
- Invoice handling (invoice.payment_succeeded, invoice.payment_failed)
- Customer Portal session for self-service management
- Subscription cancellation with cancel_at_period_end
- Proration handling for plan upgrades/downgrades
        `, contextData);
    }
}

export const stripeAgent = Object.freeze(new StripeAgent());
