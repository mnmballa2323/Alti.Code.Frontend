import express from 'express';
import { sentinelController } from './sentinel.controller.js';

const router = express.Router();

router.post('/watch', sentinelController.startWatch);
router.post('/scan', sentinelController.scanSystem);

export const sentinelRoutes = router;
