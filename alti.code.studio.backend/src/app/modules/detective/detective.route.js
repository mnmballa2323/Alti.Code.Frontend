import express from 'express';
import { detectiveController } from './detective.controller.js';

const router = express.Router();

router.post('/audit', detectiveController.auditCodebase);
router.post('/logs', detectiveController.analyzeLogs);
router.get('/dependencies', detectiveController.checkDependencies);

export const detectiveRoutes = router;
