/**
 * Hooks Routes
 */
import express from 'express';
import { hooksController } from './hooks.controller.js';

const router = express.Router();

router.get('/', (req, res) => hooksController.listHooks(req, res));
router.post('/', (req, res) => hooksController.createHook(req, res));
router.get('/:id', (req, res) => hooksController.getHook(req, res));
router.put('/:id', (req, res) => hooksController.updateHook(req, res));
router.delete('/:id', (req, res) => hooksController.deleteHook(req, res));
router.post('/:id/fire', (req, res) => hooksController.fireHook(req, res));
router.post('/events/trigger', (req, res) =>
  hooksController.triggerEvent(req, res),
);

export const hooksRoutes = router;
