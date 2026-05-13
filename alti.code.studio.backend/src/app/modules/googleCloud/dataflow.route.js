import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { DataflowController } from './dataflow.controller.js';

const router = express.Router();

router.post(
    '/launch',
    auth(ENUM_USER_ROLE.ADMIN),
    DataflowController.launchIngestionPipeline
);

export const DataflowRoutes = router;
