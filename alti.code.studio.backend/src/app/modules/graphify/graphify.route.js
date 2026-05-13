import express from 'express';
import { graphifyController } from './graphify.controller.js';

const router = express.Router();

// Define /api/v1/graphify/extract
router.post('/extract', graphifyController.extractGraph);

// Define /api/v1/graphify/pagerank
router.get('/pagerank', graphifyController.getPageRank);

export const graphifyRoutes = router;
