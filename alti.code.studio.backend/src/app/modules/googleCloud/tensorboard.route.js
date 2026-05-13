import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { TensorboardController } from './tensorboard.controller.js';

const router = express.Router();

router.post(
    '/log',
    auth(ENUM_USER_ROLE.ADMIN),
    TensorboardController.logMetric
);

export const TensorboardRoutes = router;
