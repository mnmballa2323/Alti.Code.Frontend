import express from 'express';
import * as sandyaaController from './sandyaa.controller.js';
import { rbacService } from '../security/rbac.middleware.js';

const router = express.Router();

router.post('/audit', rbacService.requireRole('ADMIN'), sandyaaController.runAudit);

export const SandyaaRoutes = router;
