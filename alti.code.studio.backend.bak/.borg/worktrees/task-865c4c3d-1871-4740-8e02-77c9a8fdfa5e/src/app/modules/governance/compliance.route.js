/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import express from 'express';
import { GovernanceController } from './governance.controller.js';
import { rbac } from '../../middlewares/rbac.middleware.js';

const router = express.Router();

// Only ADMIN and AUDITOR can view audit logs
router.get('/audit-logs', rbac('ADMIN', 'AUDITOR'), GovernanceController.getAuditLogs);

export const ComplianceRoutes = router;
