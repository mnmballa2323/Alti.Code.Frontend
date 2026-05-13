/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ShadowWorkspaceController } from './shadowWorkspace.controller.js';

const router = express.Router();

router.post('/init', ShadowWorkspaceController.initShadow);
router.post('/apply', ShadowWorkspaceController.applyDiff);
router.post('/run', ShadowWorkspaceController.runCommand);
router.post('/commit', ShadowWorkspaceController.commitShadow);

export const shadowWorkspaceRoutes = router;
