import express from 'express';
import { liaisonController } from './liaison.controller.js';

const router = express.Router();

router.post('/webhook/:source', liaisonController.webhook);

export const liaisonRoutes = router;
