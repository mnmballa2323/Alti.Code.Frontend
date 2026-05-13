import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { GeocodingController } from './geocoding.controller.js';

const router = express.Router();

router.get(
    '/forward',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    GeocodingController.forwardGeocode
);

router.get(
    '/reverse',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    GeocodingController.reverseGeocode
);

export const GeocodingRoutes = router;
