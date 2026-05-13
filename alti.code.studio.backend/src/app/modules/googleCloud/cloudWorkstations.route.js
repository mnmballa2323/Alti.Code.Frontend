import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { CloudWorkstationsController } from './cloudWorkstations.controller.js';
import { RateLimitService } from '../security/rateLimit.service.js';

const router = express.Router();

router.post(
    '/provision',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.DEVELOPER),
    RateLimitService.middleware(2, 60), // Max 2 provisions per minute per IP
    CloudWorkstationsController.provision
);

export const CloudWorkstationsRoutes = router;
