import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { BrowserUseAgentController } from './browserUseAgent.controller.js';

const router = express.Router();

router.post(
  '/navigate',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  BrowserUseAgentController.runAutomation,
);

router.get(
  '/:taskId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  BrowserUseAgentController.getStatus,
);

export const BrowserUseAgentRoutes = router;
