import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { VectorSearchController } from './vectorSearch.controller.js';

const router = express.Router();

router.post(
    '/upsert',
    auth(ENUM_USER_ROLE.ADMIN),
    VectorSearchController.upsertContext
);

router.post(
    '/query',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    VectorSearchController.queryContext
);

export const VectorSearchRoutes = router;
