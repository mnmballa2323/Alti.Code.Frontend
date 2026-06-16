/**
 * Copyright (c) 2026 Inso Code
 *
 * Crabbox Route Configuration
 */

import express from 'express';
import { CrabboxController } from './crabbox.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/crabbox/warmup:
 *   post:
 *     summary: Warm up a Crabbox lease
 *     tags: [Crabbox]
 */
router.post('/warmup', CrabboxController.warmup);

/**
 * @swagger
 * /api/v1/crabbox/run:
 *   post:
 *     summary: Run a command in a remote Crabbox
 *     tags: [Crabbox]
 */
router.post('/run', CrabboxController.run);

/**
 * @swagger
 * /api/v1/crabbox/status:
 *   get:
 *     summary: Check status of a Crabbox lease
 *     tags: [Crabbox]
 */
router.get('/status', CrabboxController.status);
router.get('/status/:leaseId', CrabboxController.status);

/**
 * @swagger
 * /api/v1/crabbox/stop:
 *   post:
 *     summary: Stop/release a Crabbox lease
 *     tags: [Crabbox]
 */
router.post('/stop', CrabboxController.stop);
router.delete('/stop/:leaseId', CrabboxController.stop);

/**
 * @swagger
 * /api/v1/crabbox/sync-plan:
 *   post:
 *     summary: Preview file sync details
 *     tags: [Crabbox]
 */
router.post('/sync-plan', CrabboxController.syncPlan);

export const crabboxRoutes = router;
