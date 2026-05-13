import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { TpuController } from './tpu.controller.js';

const router = express.Router();

router.post(
    '/provision',
    auth(ENUM_USER_ROLE.ADMIN),
    TpuController.provisionTpu
);

export const TpuRoutes = router;
