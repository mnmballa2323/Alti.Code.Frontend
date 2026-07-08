import express from 'express';
import { FinOpsController } from './finops.controller.js';
import { verifyGCPToken } from '../auth/gcpIap.service.js';

export const finopsRoutes = express.Router();

// The user must be authenticated. verifyGCPToken is assumed to inject req.user
finopsRoutes.get('/usage', verifyGCPToken, FinOpsController.getUserUsage);
