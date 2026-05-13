import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { UDeploymentController } from './uDeployment.controller.js';

const router = express.Router();

router.post(
    '/deploy',
    auth(ENUM_USER_ROLE.ADMIN),
    UDeploymentController.autoDeploy
);

router.post(
    '/rollback',
    auth(ENUM_USER_ROLE.ADMIN),
    UDeploymentController.rollBack
);

export const UDeploymentRoutes = router;
