import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { VoiceController } from './voice.controller.js';

const router = express.Router();

router.post(
    '/synthesize',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    VoiceController.synthesizeSpeech
);

export const VoiceRoutes = router;
