import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { SecurityController } from './security.controller.js';

const router = express.Router();

router.post(
    '/report',
    auth(ENUM_USER_ROLE.ADMIN),
    SecurityController.reportVulnerability
);

router.post(
    '/audit',
    auth(ENUM_USER_ROLE.ADMIN),
    SecurityController.auditDeployment
);

export const SecurityRoutes = router;
