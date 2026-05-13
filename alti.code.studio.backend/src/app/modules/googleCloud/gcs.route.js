import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { GcsController } from './gcs.controller.js';

const router = express.Router();

router.post(
    '/upload',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    GcsController.uploadFile
);

router.get(
    '/signed-url',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    GcsController.getSignedUrl
);

export const GcsRoutes = router;
