/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { catchAsync } from '../../../shared/catchAsync.js';
import { executeQuery, resetDatabase } from './pglite.controller.js';

const router = express.Router();

router.post('/query', catchAsync(executeQuery));
router.post('/reset', catchAsync(resetDatabase));

export const pgliteRoutes = router;
