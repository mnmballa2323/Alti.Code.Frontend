import express from 'express';
import * as ArchitectureController from './architecture.controller.js';
import './architecture.worker.js'; // Initialize the BullMQ AST worker

const router = express.Router();

router.post('/ingest/git', ArchitectureController.ingestGit);
router.post('/ingest/upload', ArchitectureController.ingestUpload);
router.get('/jobs/:id', ArchitectureController.getJobStatus);

router.get('/graph', ArchitectureController.getGraph);
router.get('/nodes/:id', ArchitectureController.getNodeDetails);
router.get('/clusters/:layer', ArchitectureController.getClusterDetails);

router.post('/ask', ArchitectureController.askQuestion);

export const architectureRoutes = router;
