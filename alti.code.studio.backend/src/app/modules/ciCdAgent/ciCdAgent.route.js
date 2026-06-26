/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { CiCdAgentController } from './ciCdAgent.controller.js';

const router = express.Router();

router.post('/pipeline', CiCdAgentController.triggerPipeline);

export const ciCdAgentRoutes = router;
