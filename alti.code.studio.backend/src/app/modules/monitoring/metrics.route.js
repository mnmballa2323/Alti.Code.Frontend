import express from 'express';
import { metricsController } from './metrics.controller.js';

const router = express.Router();

router.get('/mission-control/stats', metricsController.getMissionControlStats);
router.get('/user/stats', metricsController.getUserStats);
router.get('/user/history', metricsController.getUserHistory);

export const metricsRoute = router;
