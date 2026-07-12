import express from 'express';
import { LoopEngineeringController } from './loopEngineering.controller.js';

const router = express.Router();

router.post('/audit', LoopEngineeringController.audit);
router.post('/init', LoopEngineeringController.init);
router.post('/cost', LoopEngineeringController.getCost);
router.get('/patterns', LoopEngineeringController.listPatterns);
router.post('/sync', LoopEngineeringController.sync);
router.post('/context', LoopEngineeringController.context);
router.post('/worktree', LoopEngineeringController.worktree);


export { router as loopEngineeringRoutes };
