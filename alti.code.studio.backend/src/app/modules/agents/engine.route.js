import express from 'express';
import { engineController } from './engine.controller.js';
import upload from '../../../shared/upload.js'; // Assuming a multer wrapper exists, or I will use a simple middleware

const router = express.Router();

router.get('/health', engineController.healthCheck);
router.post('/ingest', upload.single('file'), engineController.ingestFile);
router.post('/graph', engineController.analyzeGraph);
router.post('/rag/index', engineController.indexDocs);
router.post('/rag/query', engineController.askOracle);

export const engineRoutes = router;
