import express from 'express';
import { criticController } from './critic.controller.js';

const router = express.Router();

router.post('/generate-test', criticController.generateTest);
router.post('/run-tests', criticController.runTests);
router.post('/review', criticController.reviewCode);

export const criticRoutes = router;
