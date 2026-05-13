import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { CrewAiAgentController } from './crewAiAgent.controller.js';

const router = express.Router();

router.post(
    '/debate',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    CrewAiAgentController.startDebate
);

router.post(
    '/spec',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    CrewAiAgentController.generateSpec
);

export const CrewAiAgentRoutes = router;
