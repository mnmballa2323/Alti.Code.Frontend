/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { SynapseController } from './synapse.controller.js';

const router = express.Router();

import { cacheService } from '../cache/cache.service.js';

router.post('/register', SynapseController.register);
router.post('/broadcast', SynapseController.broadcast);
router.post('/message', SynapseController.sendDirect);
router.get('/stream', SynapseController.streamEvents);
router.get('/agents', cacheService.middleware(30), SynapseController.listAgents);

export const synapseRoutes = router;
