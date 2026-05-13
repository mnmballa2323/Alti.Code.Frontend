import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { AssetController } from './asset.controller.js';

const router = express.Router();

router.get(
    '/iam',
    auth(ENUM_USER_ROLE.ADMIN),
    AssetController.searchIAMPolicy
);

router.get(
    '/resources',
    auth(ENUM_USER_ROLE.ADMIN),
    AssetController.searchResources
);

export const AssetRoutes = router;
