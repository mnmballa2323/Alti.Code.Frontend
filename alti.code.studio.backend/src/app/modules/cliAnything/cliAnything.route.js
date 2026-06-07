/**
 * Copyright (c) 2024–2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { CliAnythingController } from './cliAnything.controller.js';
import '../agents/cliAnything.agent.js'; // Trigger dynamic registration of Swarm Agent

const router = express.Router();

router.post('/generate', CliAnythingController.generate);
router.post('/refine', CliAnythingController.refine);
router.get('/discover', CliAnythingController.discover);
router.post('/execute', CliAnythingController.execute);

export const CliAnythingRoutes = router;
