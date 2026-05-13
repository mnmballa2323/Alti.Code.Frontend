import express from 'express';
import { directorController } from './director.controller.js';

const router = express.Router();

router.post('/mission', directorController.startMission);
router.get('/mission/:missionId', directorController.getMissionStatus);

export const directorRoutes = router;
