/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { GenesisController } from './genesis.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { ENUM_USER_ROLE } from '../../../enums/user.js';

const router = express.Router();
const adminOnly = authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN);

// POST /api/v1/genesis/ignite -> Kick off end-to-end autonomous genesis
router.post('/ignite', adminOnly, GenesisController.launchGenesis);

// GET /api/v1/genesis/stream -> Listen to Genesis SSE stream
router.get('/stream', adminOnly, GenesisController.genesisStream);

export const genesisRoutes = router;
