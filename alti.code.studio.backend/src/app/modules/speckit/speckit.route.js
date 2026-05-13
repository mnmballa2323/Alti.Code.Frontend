/**
 * SpecKit Routes — spec-driven development API
 */

import express from 'express';
import { specKitController } from './speckit.controller.js';

const router = express.Router();

// Feature specs
router.post('/', (req, res) => specKitController.createSpec(req, res));
router.get('/', (req, res) => specKitController.listSpecs(req, res));
router.get('/:id', (req, res) => specKitController.getSpec(req, res));
router.delete('/:id', (req, res) => specKitController.deleteSpec(req, res));

// 3-phase generation
router.post('/:id/design', (req, res) => specKitController.createDesign(req, res));
router.post('/:id/tasks', (req, res) => specKitController.createTasks(req, res));
router.post('/:id/tasks/:idx/execute', (req, res) => specKitController.executeTask(req, res));

// Bugfix specs
router.post('/bugfix/create', (req, res) => specKitController.createBugfixSpec(req, res));

export const speckitRoutes = router;
