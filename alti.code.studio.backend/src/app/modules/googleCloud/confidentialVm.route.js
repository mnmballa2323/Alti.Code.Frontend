import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { ConfidentialVmController } from './confidentialVm.controller.js';

const router = express.Router();

router.post(
    '/spawn',
    auth(ENUM_USER_ROLE.ADMIN),
    ConfidentialVmController.spawnConfidentialWorker
);

export const ConfidentialVmRoutes = router;
