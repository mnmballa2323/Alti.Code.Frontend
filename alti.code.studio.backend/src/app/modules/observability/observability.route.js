import express from 'express';
import { ObservabilityController } from './observability.controller.js';

const router = express.Router();

router.get('/swarm', ObservabilityController.getSwarmTelemetry);

export const observabilityRoutes = router;
export default router;
