import express from 'express';
import { GithubWebhookController } from './githubWebhook.controller.js';

const router = express.Router();

/**
 * @route POST /api/github/webhook
 * @desc Handle incoming GitHub Webhooks for Continuous RAG Ingestion and Auto-Review
 * @access Public (Webhooks should ideally use signature verification in production)
 */
router.post('/webhook', GithubWebhookController.handleWebhook);

export const GithubRoutes = router;
