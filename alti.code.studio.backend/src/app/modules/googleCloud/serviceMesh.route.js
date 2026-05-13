import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { ServiceMeshController } from './serviceMesh.controller.js';

const router = express.Router();

router.post(
    '/register',
    auth(ENUM_USER_ROLE.ADMIN),
    ServiceMeshController.registerWorker
);

export const ServiceMeshRoutes = router;
