import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { OpenHandsAgentController } from './openHandsAgent.controller.js';

const router = express.Router();

router.post(
    '/run',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    OpenHandsAgentController.startSession
);

router.get(
    '/:sessionId',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    OpenHandsAgentController.getSessionStatus
);

export const OpenHandsAgentRoutes = router;
