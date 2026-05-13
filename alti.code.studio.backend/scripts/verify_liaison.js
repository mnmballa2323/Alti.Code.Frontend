import { LiaisonService } from '../src/app/modules/liaison/liaison.service.js';
import { logger } from '../src/shared/logger.js';

const runVerification = async () => {
    logger.info("Starting Liaison Agent Verification...");

    try {
        // 1. Verify GitHub Webhook (PR Open)
        logger.info("1. Testing GitHub Webhook (PR Open)...");
        const ghPR = await LiaisonService.handleWebhook('github', {
            event: 'pull_request',
            action: 'opened',
            pull_request: { url: 'https://github.com/test/repo/pull/1' }
        });
        logger.info("GitHub PR Result:", ghPR);
        if (ghPR.status !== 'dispatched') throw new Error("GitHub PR dispatch failed");

        // 2. Verify GitHub Webhook (Security)
        logger.info("2. Testing GitHub Webhook (Security Advisory)...");
        const ghSec = await LiaisonService.handleWebhook('github', {
            event: 'security_advisory'
        });
        logger.info("GitHub Security Result:", ghSec);
        if (ghSec.status !== 'dispatched') throw new Error("GitHub Security dispatch failed");

        // 3. Verify Stripe Webhook
        logger.info("3. Testing Stripe Webhook...");
        const stripe = await LiaisonService.handleWebhook('stripe', {
            type: 'payment_intent.succeeded'
        });
        logger.info("Stripe Result:", stripe);
        if (stripe.status !== 'processed') throw new Error("Stripe webhook failed");

        logger.info("Liaison Verification Complete.");
        process.exit(0);

    } catch (error) {
        logger.error("Verification Failed", error);
        process.exit(1);
    }
};

runVerification();
