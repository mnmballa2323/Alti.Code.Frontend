import express from 'express';
import { RefactorAgentController } from './refactorAgent.controller.js';

const router = express.Router();

router.post('/refactor', RefactorAgentController.startRefactor);

export const refactorAgentRoutes = router;
