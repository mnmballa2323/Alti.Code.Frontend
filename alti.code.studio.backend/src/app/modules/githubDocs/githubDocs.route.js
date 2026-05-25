import express from 'express';
import { GithubDocsController } from './githubDocs.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: GitHubDocs
 *   description: GitHub Developer Documentation Ingestion Engine
 */

router.post('/sync', GithubDocsController.triggerSync);
router.get('/status', GithubDocsController.getStatus);
router.post('/search', GithubDocsController.search);
router.post('/consult', GithubDocsController.consultSwarm);
router.post('/cancel', GithubDocsController.cancelSync);

// Cognitive Intelligence Endpoints
router.post('/webhook/healing', GithubDocsController.processSelfHealingWebhook);
router.post('/visual-audit', GithubDocsController.auditPrVisualLayout);
router.post('/orchestrate', GithubDocsController.orchestrate);
router.post('/blast-radius', GithubDocsController.analyzeBlastRadius);

export const githubDocsRoutes = router;
export default router;
