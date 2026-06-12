/**
 * Copyright (c) 2026 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { OwnerController } from './owner.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 🔒 Owner Only
router.get(
    '/owner-metrics',
    authMiddleware('owner'),
    OwnerController.getMetrics
);

export const OwnerRoutes = router;
