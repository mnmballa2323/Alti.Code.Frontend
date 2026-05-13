import express from 'express';
import { captainController } from './captain.controller.js';

const router = express.Router();

router.get('/health', captainController.checkHealth);
router.get('/status', captainController.getStatus);
router.post('/emergency', captainController.emergency);

export const captainRoutes = router;
