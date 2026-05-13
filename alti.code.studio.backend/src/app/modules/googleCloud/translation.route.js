import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { TranslationController } from './translation.controller.js';

const router = express.Router();

router.post(
    '/text',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    TranslationController.translateText
);

router.post(
    '/detect',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    TranslationController.detectLanguage
);

export const TranslationRoutes = router;
