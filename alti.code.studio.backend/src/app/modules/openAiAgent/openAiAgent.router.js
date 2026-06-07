/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { openAiController } from './openAiAgent.controller.js';

const router = express.Router();

router.post('/programmer', openAiController.programmerAgentController);

export const openAiRoutes = router;
