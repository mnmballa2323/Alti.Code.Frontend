/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { GeminiAiController } from './gemini.controller.js';

const router = express.Router();

router.post(
  '/get-response',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  GeminiAiController.GeminiAiGetResponse,
);
router.post(
  '/flash/get-response',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  GeminiAiController.Gemini25PreviewAiGetResponse,
);
router.post(
  '/multimodal',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  GeminiAiController.GeminiMultimodalResponse,
);

export const geminiAiRoutes = router;
