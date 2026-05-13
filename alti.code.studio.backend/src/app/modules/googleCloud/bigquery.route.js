import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { BigQueryController } from './bigquery.controller.js';

const router = express.Router();

router.post(
    '/analyze',
    auth(ENUM_USER_ROLE.ADMIN),
    BigQueryController.runAnalysis
);

export const BigQueryRoutes = router;
