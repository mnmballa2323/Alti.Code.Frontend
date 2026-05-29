import express from 'express';
import { SkillOptController } from './skillopt.controller.js';

const router = express.Router();

router.post('/optimize', SkillOptController.optimizeSkill);
router.get('/run/:id', SkillOptController.getRunStatus);
router.get('/skill/:name', SkillOptController.getSkill);
router.get('/runs', SkillOptController.getRuns);

export const skilloptRoutes = router;
