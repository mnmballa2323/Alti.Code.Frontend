import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { ScalingController } from './scaling.controller.js';

const router = express.Router();

router.post(
    '/adjust',
    auth(ENUM_USER_ROLE.ADMIN),
    ScalingController.adjustCapacity
);

export const ScalingRoutes = router;
