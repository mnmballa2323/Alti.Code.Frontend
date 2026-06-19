/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { catchAsync } from '../../../shared/catchAsync.js';
import { handleSearch, handleRewrite } from './astGrep.controller.js';

const router = express.Router();

router.post('/search', catchAsync(handleSearch));
router.post('/rewrite', catchAsync(handleRewrite));

export const astGrepRoutes = router;
