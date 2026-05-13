import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { SpeechController } from './speech.controller.js';

const router = express.Router();

router.post(
    '/recognize',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    SpeechController.recognizeSpeech
);

export const SpeechRoutes = router;
