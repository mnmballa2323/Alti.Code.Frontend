import express from 'express';
import { UltimateRagController } from './ultimate_rag.controller.js';

const router = express.Router();

/**
 * 🚀 Exposes the Ultimate Google RAG Sequence
 * Triggered via POST /api/v1/rag/ultimate
 */
router.post('/ultimate', UltimateRagController.executeUltimateRag);

export const UltimateRagRoutes = router;
