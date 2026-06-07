/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import { AuditController } from './audit.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: System Audit Logs (Admin Only)
 */

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: Retrieve system audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: actor
 *         schema:
 *           type: string
 *         description: Filter by actor (email/ID)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILURE, DENIED, WARNING]
 *     responses:
 *       200:
 *         description: List of audit logs
 *       403:
 *         description: Forbidden (Non-Admins)
 */
router.get('/', authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), AuditController.getLogs);

/**
 * @swagger
 * /audit/export/gcs:
 *   post:
 *     summary: Export logs to GCP WORM bucket
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 */
router.post('/export/gcs', authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), AuditController.exportLogsToGCS);
router.post('/analyze', authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), AuditController.analyzeLogs);
router.post('/lighthouse', authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), AuditController.runLighthouseAudit);
router.post('/genkit', authMiddleware(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), AuditController.runGenkitAudit);

export const AuditRoutes = router;
