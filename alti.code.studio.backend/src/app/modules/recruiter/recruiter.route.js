import express from 'express';
import { recruiterController } from './recruiter.controller.js';

const router = express.Router();

router.post('/onboard', recruiterController.onboard);
router.post('/training-plan', recruiterController.trainingPlan);

export const recruiterRoutes = router;
