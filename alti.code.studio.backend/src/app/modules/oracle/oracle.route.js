import express from 'express';
import { oracleController } from './oracle.controller.js';

const router = express.Router();

router.post('/analyze-query', oracleController.analyzeQuery);
router.post('/detect-n-plus-one', oracleController.detectNPlusOne);

export const oracleRoutes = router;
