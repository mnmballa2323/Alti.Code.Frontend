import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { KnowledgeCatalogController } from './knowledgeCatalog.controller.js';

const router = express.Router();

router.post(
    '/init',
    auth(ENUM_USER_ROLE.ADMIN),
    KnowledgeCatalogController.initBundle
);

router.post(
    '/sync',
    auth(ENUM_USER_ROLE.ADMIN),
    KnowledgeCatalogController.syncBundle
);

router.post(
    '/enrich',
    auth(ENUM_USER_ROLE.ADMIN),
    KnowledgeCatalogController.enrichBundle
);

router.post(
    '/query',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    KnowledgeCatalogController.queryCatalog
);

export const KnowledgeCatalogRoutes = router;
