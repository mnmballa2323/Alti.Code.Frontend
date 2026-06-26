/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { watchmanController } from './watchman.controller.js';

const router = express.Router();

router.post('/:source', (req, res) =>
  watchmanController.receiveSignal(req, res),
);

export const watchmanRoutes = router;
