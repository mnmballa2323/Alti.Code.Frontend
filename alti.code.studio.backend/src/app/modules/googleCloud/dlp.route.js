import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { DlpController } from './dlp.controller.js';

const router = express.Router();

router.post(
    '/inspect',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    DlpController.inspectText
);

router.post(
    '/redact',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    DlpController.redactText
);

export const DlpRoutes = router;
