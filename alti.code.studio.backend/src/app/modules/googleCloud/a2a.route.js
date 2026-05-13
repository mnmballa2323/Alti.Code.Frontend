import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { A2aController } from './a2a.controller.js';

const router = express.Router();

router.post(
    '/negotiate',
    auth(ENUM_USER_ROLE.ADMIN),
    A2aController.negotiateTask
);

router.post(
    '/handshake',
    auth(ENUM_USER_ROLE.ADMIN),
    A2aController.executeHandshake
);

export const A2aRoutes = router;
