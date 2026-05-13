import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { DataprocController } from './dataproc.controller.js';

const router = express.Router();

router.post(
    '/ingest',
    auth(ENUM_USER_ROLE.ADMIN),
    DataprocController.ingestMonorepo
);

export const DataprocRoutes = router;
