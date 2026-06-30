import express from 'express';
import { metricsController } from './metrics.controller.js';

const router = express.Router();

router.get('/mission-control/stats', metricsController.getMissionControlStats);
router.get('/user/stats', metricsController.getUserStats);

export const metricsRoute = router;
