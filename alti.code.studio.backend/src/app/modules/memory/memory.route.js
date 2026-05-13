import express from 'express';
import { MemoryController } from './memory.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Memory
 *   description: Enterprise Vector Memory endpoints
 */

/**
 * @swagger
 * /api/v1/memory:
 *   get:
 *     summary: Retrieve recent memory entries from the Vector DB
 *     tags: [Memory]
 *     responses:
 *       200:
 *         description: Successfully retrieved memory list
 */
router.get('/', MemoryController.listMemory);

export const memoryRoutes = router;
