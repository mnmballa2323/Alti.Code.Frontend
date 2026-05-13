import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { SmartRouterController } from './smartRouter.controller.js';

const router = express.Router();

router.post(
    '/route-task',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.DEVELOPER),
    SmartRouterController.determineRoute
);

router.post(
    '/register',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
    SmartRouterController.registerDynamicAgent
);

export const SmartRouterRoutes = router;
