import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { LangGraphAgentController } from './langGraphAgent.controller.js';

const router = express.Router();

router.post(
  '/run',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  LangGraphAgentController.executeGraph,
);

export const LangGraphAgentRoutes = router;
