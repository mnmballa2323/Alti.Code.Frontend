/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { IacAgentController } from './iacAgent.controller.js';

const router = express.Router();

router.post('/apply', IacAgentController.applyInfrastructure);

export const iacAgentRoutes = router;
