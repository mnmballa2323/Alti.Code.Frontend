/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { AnalystController } from './analyst.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// 🔒 Admin/Owner Only
router.get(
    '/trends',
    authMiddleware('admin', 'owner'),
    AnalystController.getTrends
);

router.get(
    '/stats',
    authMiddleware('admin', 'owner'),
    AnalystController.getDailyStats
);

export const AnalystRoutes = router;
