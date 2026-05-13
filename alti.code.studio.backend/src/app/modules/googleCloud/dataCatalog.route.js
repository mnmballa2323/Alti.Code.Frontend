import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { DataCatalogController } from './dataCatalog.controller.js';

const router = express.Router();

router.post(
    '/govern',
    auth(ENUM_USER_ROLE.ADMIN),
    DataCatalogController.governFile
);

export const DataCatalogRoutes = router;
