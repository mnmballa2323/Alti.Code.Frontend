import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { VisionController } from './vision.controller.js';

const router = express.Router();

router.post(
    '/detect-text',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    VisionController.detectText
);

router.post(
    '/detect-logos',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    VisionController.detectLogos
);

export const VisionRoutes = router;
