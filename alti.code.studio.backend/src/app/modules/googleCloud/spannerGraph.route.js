import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { SpannerGraphController } from './spannerGraph.controller.js';
import { RateLimitService } from '../security/rateLimit.service.js';

const router = express.Router();

router.post(
    '/traverse',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    RateLimitService.middleware(10, 60), // Max 10 traversals per minute per IP
    SpannerGraphController.traverseAstGraph
);

router.post(
    '/ingest',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.DEVELOPER),
    RateLimitService.middleware(5, 60), // Max 5 ingestions per minute per IP
    SpannerGraphController.ingestAstGraph
);

export const SpannerGraphRoutes = router;
