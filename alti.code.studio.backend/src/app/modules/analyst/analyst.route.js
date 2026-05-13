import express from 'express';
import { analystController } from './analyst.controller.js';

const router = express.Router();

router.get('/analyze', analystController.analyzeTraffic);
router.get('/predict', analystController.predictLoad);

export const analystRoutes = router;
