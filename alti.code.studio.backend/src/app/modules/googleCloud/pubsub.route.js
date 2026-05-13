import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { PubSubController } from './pubsub.controller.js';

const router = express.Router();

router.post(
    '/publish',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    PubSubController.publishEvent
);

export const PubSubRoutes = router;
