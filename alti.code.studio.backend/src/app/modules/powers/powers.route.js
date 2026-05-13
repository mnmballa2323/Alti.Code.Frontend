/**
 * Powers Routes
 */
import express from 'express';
import { powersController } from './powers.controller.js';

const router = express.Router();

router.get('/', (req, res) => powersController.listAvailable(req, res));
router.get('/installed', (req, res) => powersController.listInstalled(req, res));
router.get('/:id', (req, res) => powersController.getPowerDetails(req, res));
router.post('/:id/install', (req, res) => powersController.installPower(req, res));
router.delete('/:id/uninstall', (req, res) => powersController.uninstallPower(req, res));

export const powersRoutes = router;
