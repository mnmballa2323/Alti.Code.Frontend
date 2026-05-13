import express from 'express';
import { GeneratorController } from './generator.controller.js';

const router = express.Router();

router.post('/app', GeneratorController.generate);
router.post('/project', GeneratorController.generateProject);
router.post('/refine', GeneratorController.refine);

export const generatorRoutes = router;
