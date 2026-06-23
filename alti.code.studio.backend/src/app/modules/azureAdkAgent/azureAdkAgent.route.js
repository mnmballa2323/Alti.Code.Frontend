import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { AzureAdkAgentController } from './azureAdkAgent.controller.js';

const router = express.Router();

router.post(
    '/execute',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    AzureAdkAgentController.executeTask
);

export const AzureAdkAgentRoutes = router;
