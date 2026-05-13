import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { EarController } from './ear.controller.js';

const router = express.Router();

router.post(
    '/transcribe',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    EarController.transcribeCommand
);

export const EarRoutes = router;
