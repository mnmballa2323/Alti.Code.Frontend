import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { MlopsController } from './mlops.controller.js';

const router = express.Router();

router.post(
    '/evaluate',
    auth(ENUM_USER_ROLE.ADMIN),
    MlopsController.evaluateOutput
);

router.get(
    '/features',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    MlopsController.getPrecomputedFeatures
);

export const MlopsRoutes = router;
