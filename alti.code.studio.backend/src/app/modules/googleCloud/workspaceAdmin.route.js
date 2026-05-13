import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { WorkspaceAdminController } from './workspaceAdmin.controller.js';

const router = express.Router();

router.post(
    '/provision',
    auth(ENUM_USER_ROLE.ADMIN),
    WorkspaceAdminController.provisionAccount
);

router.post(
    '/suspend',
    auth(ENUM_USER_ROLE.ADMIN),
    WorkspaceAdminController.suspendAccount
);

export const WorkspaceAdminRoutes = router;
