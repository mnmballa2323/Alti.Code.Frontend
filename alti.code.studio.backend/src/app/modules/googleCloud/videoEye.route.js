import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { VideoEyeController } from './videoEye.controller.js';

const router = express.Router();

router.post(
    '/analyze',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    VideoEyeController.analyzeVideo
);

export const VideoEyeRoutes = router;
