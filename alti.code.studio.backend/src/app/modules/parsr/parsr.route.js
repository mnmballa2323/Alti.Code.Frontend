/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { ParsrController } from './parsr.controller.js';

const router = express.Router();

router.post('/parse', ParsrController.parseDocument);

export const parsrRoutes = router;
