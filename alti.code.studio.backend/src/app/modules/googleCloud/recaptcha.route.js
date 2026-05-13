import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { RecaptchaController } from './recaptcha.controller.js';

const router = express.Router();

router.post(
    '/assess',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    RecaptchaController.assessRisk
);

export const RecaptchaRoutes = router;
