/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { UserConnectionController } from './userConnection.controller.js';
import authMiddleware from '../../middlewares/auth/auth.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';

const router = express.Router();
const requireAuth = authMiddleware(
  ENUM_USER_ROLE.USER,
  ENUM_USER_ROLE.ADMIN,
  ENUM_USER_ROLE.SUPER_ADMIN,
);

// Initiate redirect
router.get('/connect/:provider', requireAuth, UserConnectionController.initiateOAuth);

// OAuth Callbacks
router.get('/callback/:provider', UserConnectionController.oauthCallback);

// User-scoped connections management
router.get('/active', requireAuth, UserConnectionController.getActiveConnections);
router.delete('/disconnect/:provider', requireAuth, UserConnectionController.disconnectProvider);
router.post('/custom', requireAuth, UserConnectionController.saveCustomConnection);
router.post('/test-db', requireAuth, UserConnectionController.testDatabaseConnection);

export const userConnectionRoutes = router;
