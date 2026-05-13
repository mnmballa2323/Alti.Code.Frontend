import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { WorkspaceController } from './workspace.controller.js';

const router = express.Router();

router.post(
    '/read-spec',
    auth(ENUM_USER_ROLE.ADMIN),
    WorkspaceController.readTechnicalSpec
);

router.post(
    '/email',
    auth(ENUM_USER_ROLE.ADMIN),
    WorkspaceController.sendEmailReport
);

export const WorkspaceRoutes = router;
