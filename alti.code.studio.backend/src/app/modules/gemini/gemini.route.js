/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
<<<<<<< HEAD
=======
import { RateLimitService } from '../security/rateLimit.service.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
import { GeminiAiController } from './gemini.controller.js';

const router = express.Router();

<<<<<<< HEAD
router.post(
  '/get-response',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
=======
const protect = process.env.NODE_ENV === 'production' 
  ? auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER) 
  : (req, res, next) => next();

router.post(
  '/get-response',
  protect,
  RateLimitService.middleware(50, 60),
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  GeminiAiController.GeminiAiGetResponse,
);
router.post(
  '/flash/get-response',
<<<<<<< HEAD
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
=======
  protect,
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  GeminiAiController.Gemini25PreviewAiGetResponse,
);
router.post(
  '/multimodal',
<<<<<<< HEAD
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
=======
  protect,
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  GeminiAiController.GeminiMultimodalResponse,
);

export const geminiAiRoutes = router;
