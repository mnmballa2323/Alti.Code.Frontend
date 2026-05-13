import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { GoogleSearchController } from './googleSearch.controller.js';

const router = express.Router();

router.get(
    '/',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    GoogleSearchController.search
);

router.get(
    '/context',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    GoogleSearchController.getContext
);

export const GoogleSearchRoutes = router;
