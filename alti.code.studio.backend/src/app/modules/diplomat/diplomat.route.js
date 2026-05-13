import express from 'express';
import { diplomatController } from './diplomat.controller.js';

const router = express.Router();

router.post('/extract', diplomatController.extractStrings);
router.post('/translate', diplomatController.translate);

export const diplomatRoutes = router;
