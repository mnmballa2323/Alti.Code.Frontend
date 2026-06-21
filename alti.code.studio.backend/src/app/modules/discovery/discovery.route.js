/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Discovery Router.
 * Exposes local catalog generation, federated crawler resolve, and registration endpoints.
 */

import express from 'express';
import { DiscoveryController } from './discovery.controller.js';

const router = express.Router();

router.get('/', DiscoveryController.getCatalog);
router.get('/federated', DiscoveryController.getFederatedCatalogs);
router.delete('/federated/:domain', DiscoveryController.removeFederatedCatalog);
router.post('/resolve', DiscoveryController.resolveCatalog);
router.post('/install', DiscoveryController.installResource);

export const discoveryRoutes = router;
