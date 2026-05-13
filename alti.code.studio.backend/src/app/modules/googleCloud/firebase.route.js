import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { FirebaseController } from './firebase.controller.js';

const router = express.Router();

router.post(
    '/stream',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FirebaseController.streamEvent
);

router.post(
    '/push',
    auth(ENUM_USER_ROLE.ADMIN),
    FirebaseController.sendPushNotification
);

export const FirebaseRoutes = router;
