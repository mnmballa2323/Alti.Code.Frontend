/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { RateLimitService } from '../security/rateLimit.service.js';
import { GeminiAiController } from './gemini.controller.js';

const router = express.Router();

const protect =
  process.env.NODE_ENV === 'production'
    ? auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER)
    : (req, res, next) => next();

router.post(
  '/get-response',
  protect,
  RateLimitService.middleware(50, 60),
  GeminiAiController.GeminiAiGetResponse,
);
router.post(
  '/flash/get-response',
  protect,
  GeminiAiController.Gemini25PreviewAiGetResponse,
);
router.post(
  '/multimodal',
  protect,
  GeminiAiController.GeminiMultimodalResponse,
);

export const geminiAiRoutes = router;
