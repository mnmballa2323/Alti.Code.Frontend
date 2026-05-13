import express from 'express';
import { surgeonController } from './surgeon.controller.js';

const router = express.Router();

router.post('/refactor', surgeonController.applyPattern);
router.post('/complexity', surgeonController.analyzeComplexity);
router.post('/autonomic/sweep', surgeonController.triggerAutonomicSweep);

export const surgeonRoutes = router;
