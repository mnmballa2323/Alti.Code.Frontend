import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { TraceController } from './trace.controller.js';

const router = express.Router();

router.post(
    '/operation',
    auth(ENUM_USER_ROLE.ADMIN),
    TraceController.traceOperation
);

export const TraceRoutes = router;
