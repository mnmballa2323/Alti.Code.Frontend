import express from 'express';
import { strategistController } from './strategist.controller.js';

const router = express.Router();

router.post('/optimize', strategistController.optimize);
router.get('/analyze', strategistController.analyze);

export const strategistRoutes = router;
