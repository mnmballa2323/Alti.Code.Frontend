/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { GoogleGenAiController } from './googleGenAi.controller.js';

const router = express.Router();

router.post('/generate', GoogleGenAiController.generate);
router.post('/chat', GoogleGenAiController.chat);

export const googleGenAiRoutes = router;
