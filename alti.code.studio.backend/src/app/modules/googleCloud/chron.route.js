import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { ChronController } from './chron.controller.js';

const router = express.Router();

router.post(
    '/job',
    auth(ENUM_USER_ROLE.ADMIN),
    ChronController.scheduleJob
);

export const ChronRoutes = router;
