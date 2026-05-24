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
router.post('/cancel', GithubDocsController.cancelSync);

export const githubDocsRoutes = router;
export default router;
