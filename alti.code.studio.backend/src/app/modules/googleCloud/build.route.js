import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { BuildController } from './build.controller.js';

const router = express.Router();

router.post(
    '/trigger',
    auth(ENUM_USER_ROLE.ADMIN),
    BuildController.triggerBuild
);

export const BuildRoutes = router;
