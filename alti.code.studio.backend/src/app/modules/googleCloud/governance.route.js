import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { GovernanceController } from './governance.controller.js';

const router = express.Router();

router.post(
    '/check',
    auth(ENUM_USER_ROLE.ADMIN),
    GovernanceController.checkGovernance
);

export const GovernanceRoutes = router;
