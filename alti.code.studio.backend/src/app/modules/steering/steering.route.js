/**
 * Steering Routes
 */
import express from 'express';
import { steeringController } from './steering.controller.js';

const router = express.Router();

router.get('/', (req, res) => steeringController.listSteering(req, res));
router.post('/', (req, res) => steeringController.createSteering(req, res));
router.get('/context', (req, res) => steeringController.getActiveContext(req, res));
router.post('/init-defaults', (req, res) => steeringController.initDefaults(req, res));
router.get('/:filename', (req, res) => steeringController.getSteering(req, res));
router.put('/:filename', (req, res) => steeringController.updateSteering(req, res));
router.delete('/:filename', (req, res) => steeringController.deleteSteering(req, res));

export const steeringRoutes = router;
