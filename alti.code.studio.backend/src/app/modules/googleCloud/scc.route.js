import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { SccController } from './scc.controller.js';

const router = express.Router();

router.post(
    '/report',
    auth(ENUM_USER_ROLE.ADMIN),
    SccController.reportVulnerability
);

export const SccRoutes = router;
