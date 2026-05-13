import express from 'express';
import { marketplaceController } from './marketplace.controller.js';

const router = express.Router();

// Community catalog
router.get('/agents', marketplaceController.listAgents);
router.get('/agents/:agentId', marketplaceController.getAgentDetails);

// Installed agents
router.get('/installed', marketplaceController.listInstalled);

// Lifecycle
router.post('/install', marketplaceController.installAgent);
router.delete('/uninstall/:agentId', marketplaceController.uninstallAgent);

export const marketplaceRoutes = router;
