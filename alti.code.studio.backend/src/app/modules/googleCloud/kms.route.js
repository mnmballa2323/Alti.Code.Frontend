import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { KmsController } from './kms.controller.js';

const router = express.Router();

router.post(
    '/encrypt',
    auth(ENUM_USER_ROLE.ADMIN),
    KmsController.encryptPayload
);

router.post(
    '/decrypt',
    auth(ENUM_USER_ROLE.ADMIN),
    KmsController.decryptPayload
);

export const KmsRoutes = router;
