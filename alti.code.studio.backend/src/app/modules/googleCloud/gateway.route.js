import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { GatewayController } from './gateway.controller.js';

const router = express.Router();

router.post(
    '/create',
    auth(ENUM_USER_ROLE.ADMIN),
    GatewayController.createApi
);

export const GatewayRoutes = router;
