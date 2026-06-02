import express from 'express';
import crypto from 'crypto';
import { logger } from '../../../shared/logger.js';
import { triBrainService } from '../agents/tri_brain.service.js';
import config from '../../../../config/index.js';

const router = express.Router();

/**
 * Validates the GitHub Webhook HMAC signature
 */
const verifyGitHubSignature = (req, res, next) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);
    const secret = config.github.webhook_secret;

    if (!signature || !secret) {
        logger.warn('⚠️ [GitHub Webhook] Missing signature or secret. Rejecting.');
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
 * Event-Driven Webhook Interceptor
 * Listens for GitHub 'push' and 'pull_request' events.
 * Instantly triggers the Tri-Brain autonomous loop.
 */
router.post('/webhook/github', verifyGitHubSignature, async (req, res) => {
    const eventType = req.headers['x-github-event'];
    const payload = req.body;

    logger.info(`🔔 [GitHub Webhook] Received Event: ${eventType}`);

    // Immediately return 202 Accepted to GitHub so the webhook doesn't time out
    res.status(202).send({ status: 'Accepted', message: 'Tri-Brain Swarm Activated.' });

    // Asynchronously process the codebase changes
    try {
        if (eventType === 'push') {
            const commits = payload.commits;
            const repoUrl = payload.repository.html_url;
            
            logger.info(`🚀 [Webhook Interceptor] Push detected on ${repoUrl}. Commits: ${commits.length}`);
            
            // For each commit, intercept the diff and send to Tri-Brain
            for (const commit of commits) {
                const intent = `Analyze this git commit diff and ensure it is flawless. Follow up with any missing tests or security patches. Commit message: ${commit.message}`;
                
                // Fire and forget the adversarial convergence loop
                const consensusResult = await triBrainService.executeConsensusLoop(intent);
                
                logger.info(`✅ [Webhook Interceptor] Tri-Brain resolved commit ${commit.id}: ${consensusResult.status}`);
            }
        } 
        else if (eventType === 'pull_request') {
            if (payload.action === 'opened' || payload.action === 'synchronize') {
                const prTitle = payload.pull_request.title;
                const prBody = payload.pull_request.body;

                logger.info(`🚀 [Webhook Interceptor] PR Event detected: ${prTitle}`);

                const intent = `Perform a full DevSecOps audit and test generation for PR: ${prTitle}. Context: ${prBody}`;
                await triBrainService.executeConsensusLoop(intent);
            }
        }
    } catch (err) {
        logger.error(`❌ [Webhook Interceptor] Autonomous execution failed: ${err.message}`);
    }
});

export const githubWebhookRoutes = router;
