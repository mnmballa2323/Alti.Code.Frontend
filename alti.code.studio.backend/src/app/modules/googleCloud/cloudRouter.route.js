import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { CloudRouterController } from './cloudRouter.controller.js';

const router = express.Router();

router.post(
    '/establish',
    auth(ENUM_USER_ROLE.ADMIN),
    CloudRouterController.establishRoute
);

export const CloudRouterRoutes = router;
