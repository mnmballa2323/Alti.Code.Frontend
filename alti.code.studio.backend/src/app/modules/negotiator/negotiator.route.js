import express from 'express';
import { negotiatorController } from './negotiator.controller.js';

const router = express.Router();

router.post('/scaffold', negotiatorController.scaffoldIntegration);
router.post('/mock', negotiatorController.generateMock);
router.post('/webhook', negotiatorController.createWebhookHandler);

export const negotiatorRoutes = router;
