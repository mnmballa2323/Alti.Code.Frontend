import express from 'express';
import crypto from 'crypto';
import { GithubWebhookController } from './githubWebhook.controller.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

const router = express.Router();

/**
 * Validates the GitHub Webhook HMAC signature to prevent spoofing
 */
const verifyGitHubSignature = (req, res, next) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);
    const secret = config.github.webhook_secret;

    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    if (!secret) {
        logger.warn('⚠️ [GitHub Webhook] Webhook secret not configured in env. Bypassing verification for local development.');
        return next();
    }

    if (!signature) {
        logger.warn('⚠️ [GitHub Webhook] Missing signature header. Rejecting request.');
        return res.status(401).send('Unauthorized');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    if (signature !== digest) {
        logger.warn('⚠️ [GitHub Webhook] Signature mismatch. Possible spoofing attack.');
        return res.status(401).send('Unauthorized');
    }

    next();
};

/**
 * @route POST /api/github/webhook
 * @desc Handle incoming GitHub Webhooks for Continuous RAG Ingestion and Auto-Review
 * @access Protected via HMAC Signature
 */
router.post('/webhook', verifyGitHubSignature, GithubWebhookController.handleWebhook);

export const GithubRoutes = router;
