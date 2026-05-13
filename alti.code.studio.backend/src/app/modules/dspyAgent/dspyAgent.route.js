import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { DspyAgentController } from './dspyAgent.controller.js';

const router = express.Router();

router.post(
    '/optimize',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    DspyAgentController.compilePrompt
);

export const DspyAgentRoutes = router;
