import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { BatchController } from './batch.controller.js';

const router = express.Router();

router.post(
    '/execute',
    auth(ENUM_USER_ROLE.ADMIN),
    BatchController.executeMassiveIngestionJob
);

export const BatchRoutes = router;
