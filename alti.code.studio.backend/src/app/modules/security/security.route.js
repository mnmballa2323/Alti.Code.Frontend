import express from 'express';
import { SecurityController } from './security.controller.js';

const router = express.Router();

router.post('/deepsec-scan', SecurityController.runDeepsecScan);

export const securityRoutes = router;
