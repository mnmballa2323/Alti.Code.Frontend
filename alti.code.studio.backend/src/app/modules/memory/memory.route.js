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

router.post('/rag/ingest', MemoryController.ragIngest);
router.post('/rag/query', MemoryController.ragQuery);
router.post('/palace/index', MemoryController.palaceIndex);
router.post('/palace/search', MemoryController.palaceSearch);
router.post('/mimo/dream', MemoryController.mimoDream);
router.post('/mimo/distill', MemoryController.mimoDistill);

export const memoryRoutes = router;
