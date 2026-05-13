import express from 'express';
import { scoutController } from './scout.controller.js';

const router = express.Router();

router.get('/updates', scoutController.checkUpdates);
router.post('/migration', scoutController.analyzeMigration);

export const scoutRoutes = router;
