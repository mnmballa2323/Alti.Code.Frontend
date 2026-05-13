/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { GitAgentController } from './gitAgent.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
<<<<<<< HEAD
import { ENUM_USER_ROLE } from '../../../enums/user.js';
=======
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

const router = express.Router();
const adminOnly = authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN);

router.post('/commit', adminOnly, GitAgentController.commit);
router.post('/push', adminOnly, GitAgentController.push);
<<<<<<< HEAD
router.get('/status', adminOnly, GitAgentController.getStatus);
=======
router.get('/status', authMiddleware('user', 'developer', 'admin', 'owner', 'super_admin'), GitAgentController.getStatus);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
router.get('/diff', adminOnly, GitAgentController.getDiff);
router.post('/generate-pr', adminOnly, GitAgentController.generatePR);
router.post('/branch', adminOnly, GitAgentController.createBranch);
router.post('/initialize', adminOnly, GitAgentController.initializeRepository);
<<<<<<< HEAD

// Unprotected Webhook route
=======
router.get('/repositories', adminOnly, GitAgentController.listRepositories);

// Unprotected Webhook route

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
router.post('/webhook/github', GitAgentController.handleGithubWebhook);

export const gitAgentRoutes = router;
