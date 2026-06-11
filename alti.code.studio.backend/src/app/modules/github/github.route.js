import express from 'express';
import crypto from 'crypto';
import { GithubWebhookController } from './githubWebhook.controller.js';
import { GithubController } from './github.controller.js';
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

// ===========================================================================
// Direct GitHub REST/GraphQL API Integration (No middle layer)
// ===========================================================================

// 1. User Info
router.get('/user', GithubController.getAuthenticatedUser);

// 2. Repositories
router.get('/repos', GithubController.listRepositories);
router.post('/repos', GithubController.createRepository);
router.get('/repos/:owner/:repo', GithubController.getRepository);
router.delete('/repos/:owner/:repo', GithubController.deleteRepository);
router.get('/repos/:owner/:repo/branches', GithubController.listBranches);

// 3. Issues
router.get('/issues/:owner/:repo', GithubController.listIssues);
router.post('/issues/:owner/:repo', GithubController.createIssue);
router.get('/issues/:owner/:repo/:number', GithubController.getIssue);
router.patch('/issues/:owner/:repo/:number', GithubController.updateIssue);

// 4. Pull Requests
router.get('/pulls/:owner/:repo', GithubController.listPullRequests);
router.post('/pulls/:owner/:repo', GithubController.createPullRequest);
router.get('/pulls/:owner/:repo/:number', GithubController.getPullRequest);
router.put('/pulls/:owner/:repo/:number/merge', GithubController.mergePullRequest);

// 5. Actions (CI/CD workflows)
router.get('/actions/:owner/:repo/workflows', GithubController.listWorkflows);
router.post('/actions/:owner/:repo/workflows/:workflowId/dispatches', GithubController.triggerWorkflowDispatch);
router.get('/actions/:owner/:repo/runs', GithubController.listWorkflowRuns);

// 6. Gists
router.get('/gists', GithubController.listGists);
router.post('/gists', GithubController.createGist);
router.delete('/gists/:gistId', GithubController.deleteGist);

// 7. Projects
router.get('/projects/:owner/:repo', GithubController.listProjects);
router.post('/projects/:owner/:repo', GithubController.createProject);

export const GithubRoutes = router;
export default router;
