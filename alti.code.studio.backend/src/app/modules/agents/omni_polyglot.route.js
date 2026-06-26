/**
 * Copyright (c) 2024 Inso Code
 *
 * Dynamic Polyglot Route Mapping
 */

import express from 'express';
import { OmniPolyglotController } from './omni_polyglot.controller.js';

const router = express.Router();

router.get('/catalog', OmniPolyglotController.getCatalog);
router.post('/summon', OmniPolyglotController.summonAgent);
router.post('/execute', OmniPolyglotController.executeAgent);

export const omniPolyglotRoutes = router;
export default router;
