import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { LlmGatewayController } from './llmGateway.controller.js';
import { RateLimitService } from '../security/rateLimit.service.js';

const router = express.Router();

const protect = process.env.NODE_ENV === 'production' 
  ? auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER) 
  : (req, res, next) => next();

router.post(
  '/generate',
  protect,
  RateLimitService.middleware(50, 60),
  LlmGatewayController.getResponse
);

export const llmGatewayRoutes = router;
