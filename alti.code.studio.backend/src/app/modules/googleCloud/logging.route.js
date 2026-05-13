import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { LoggingController } from './logging.controller.js';

const router = express.Router();

router.post(
    '/audit',
    auth(ENUM_USER_ROLE.ADMIN),
    LoggingController.auditEvent
);

export const LoggingRoutes = router;
