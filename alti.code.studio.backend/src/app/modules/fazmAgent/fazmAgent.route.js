import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { FazmAgentController } from './fazmAgent.controller.js';

const router = express.Router();

router.post(
    '/run',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.runAutomation
);

router.get(
    '/status/:taskId',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.getStatus
);

export const FazmAgentRoutes = router;
