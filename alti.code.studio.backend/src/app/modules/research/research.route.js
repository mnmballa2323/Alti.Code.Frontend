import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { ResearchController } from './research.controller.js';

const router = express.Router();

// Execute a Deep Research run
router.post(
    '/',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    ResearchController.executeResearch
);

export const ResearchRoutes = router;
