import express from 'express';
import { productOwnerController } from './productOwner.controller.js';
import auth from '../../middlewares/auth/auth.js';
import { requireMfa } from '../../middlewares/requireMfa.middleware.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';

const router = express.Router();

router.post(
  '/analyze',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.ADMIN),
  requireMfa,
  productOwnerController.analyzeRequest,
);
router.post(
  '/stories',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.ADMIN),
  requireMfa,
  productOwnerController.generateStories,
);
router.post(
  '/backlog',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.ADMIN),
  requireMfa,
  productOwnerController.addToBacklog,
);
router.post(
  '/backlog/:id/spec',
  auth(ENUM_USER_ROLE.OWNER, ENUM_USER_ROLE.ADMIN),
  requireMfa,
  productOwnerController.commissionSpec,
);

export const productOwnerRoutes = router;
