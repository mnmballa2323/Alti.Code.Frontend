import express from 'express';
import { observabilityController } from './observability.controller.js';

const router = express.Router();

router.get('/traces', observabilityController.getRecentTraces);

export const observabilityRoutes = router;
