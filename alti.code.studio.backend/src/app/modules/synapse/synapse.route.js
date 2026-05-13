
import express from 'express';
import { SynapseController } from './synapse.controller.js';
import { cacheService } from '../cache/cache.service.js';

const router = express.Router();

router.post('/register', SynapseController.register);
router.post('/broadcast', SynapseController.broadcast);
router.post('/message', SynapseController.sendDirect);
router.get('/stream', SynapseController.streamEvents);
router.post('/hive/session', SynapseController.startHiveSession);
router.get('/agents', cacheService.cacheMiddleware(30), SynapseController.listAgents);

export const synapseRoutes = router;
