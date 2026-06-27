/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { AiWebsiteClonerController } from './aiWebsiteCloner.controller.js';

const router = express.Router();

router.post(
  '/clone',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  AiWebsiteClonerController.cloneWebsite,
);

export const AiWebsiteClonerRoutes = router;
