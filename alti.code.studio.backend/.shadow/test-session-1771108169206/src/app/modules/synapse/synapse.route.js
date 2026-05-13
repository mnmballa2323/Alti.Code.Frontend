import express from 'express';
import { SynapseController } from './synapse.controller.js';

const router = express.Router();

router.post('/register', SynapseController.register);
router.post('/broadcast', SynapseController.broadcast);
router.post('/message', SynapseController.sendDirect);

export const synapseRoutes = router;
