import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { DiscoveryController } from './discovery.controller.js';

const router = express.Router();

router.get(
    '/search',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    DiscoveryController.searchCodebase
);

export const DiscoveryRoutes = router;
