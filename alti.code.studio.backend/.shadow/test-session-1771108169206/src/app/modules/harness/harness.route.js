import express from 'express';
import { HarnessController } from './harness.controller.js';

const router = express.Router();

router.post('/pipeline/run', HarnessController.runPipeline);
router.get('/pipeline/status/:executionId', HarnessController.checkStatus);

export const harnessRoutes = router;
