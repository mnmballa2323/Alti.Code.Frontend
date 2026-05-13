import express from 'express';
import { navigatorController } from './navigator.controller.js';

const router = express.Router();

router.post('/scale', navigatorController.scale);
router.get('/optimize', navigatorController.optimize);

export const navigatorRoutes = router;
