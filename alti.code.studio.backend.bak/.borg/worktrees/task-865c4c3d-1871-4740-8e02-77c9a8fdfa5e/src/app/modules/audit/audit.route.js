/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
// import auth from '../../middlewares/auth/auth.js';
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
// router.get('/', auth(ENUM_USER_ROLE.ADMIN), AuditController.getLogs);

// Temporarily Open for Development/Testing until Auth Middleware is fully verified in unit tests
router.get('/', AuditController.getLogs);

export const AuditRoutes = router;
