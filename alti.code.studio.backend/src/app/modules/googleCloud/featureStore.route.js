import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { FeatureStoreController } from './featureStore.controller.js';

const router = express.Router();

router.get(
    '/:entityId',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FeatureStoreController.getFeature
);

export const FeatureStoreRoutes = router;
