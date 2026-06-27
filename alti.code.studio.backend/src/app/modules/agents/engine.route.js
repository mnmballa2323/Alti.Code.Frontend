/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * Engine Routes
 * Maps REST paths to EngineController.
 */

import express from 'express';
import { EngineController } from './engine.controller.js';

const router = express.Router();

router.get('/list', EngineController.listRegisteredEngines);
router.post('/:engineId/run', EngineController.triggerEngineTask);

export const engineRoutes = router;
