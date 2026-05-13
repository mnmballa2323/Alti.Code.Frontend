import express from 'express';
import { simulatorController } from './simulator.controller.js';

const router = express.Router();

router.post('/run', simulatorController.runCode);
router.post('/chaos', simulatorController.injectChaos);
router.post('/load-test', simulatorController.loadTest);

export const simulatorRoutes = router;
