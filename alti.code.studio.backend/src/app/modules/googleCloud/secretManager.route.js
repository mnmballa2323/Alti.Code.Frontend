import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { SecretManagerController } from './secretManager.controller.js';

const router = express.Router();

router.get(
    '/:secretId',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    SecretManagerController.getSecret
);

router.post(
    '/update',
    auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
    SecretManagerController.updateSecret
);

export const SecretManagerRoutes = router;
