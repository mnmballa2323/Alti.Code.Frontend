import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { FirestoreSyncController } from './firestoreSync.controller.js';

const router = express.Router();

router.post(
    '/sync',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FirestoreSyncController.syncCrdt
);

router.get(
    '/load/:docName',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FirestoreSyncController.loadDoc
);

export const FirestoreSyncRoutes = router;
