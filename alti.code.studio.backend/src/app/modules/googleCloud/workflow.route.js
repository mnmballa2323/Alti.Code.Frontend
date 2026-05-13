import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { WorkflowController } from './workflow.controller.js';

const router = express.Router();

router.post(
    '/execute',
    auth(ENUM_USER_ROLE.ADMIN),
    WorkflowController.executeSwarm
);

router.post(
    '/',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    WorkflowController.createWorkflow
);

export const WorkflowRoutes = router;
