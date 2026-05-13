import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { DocumentAiController } from './documentAi.controller.js';

const router = express.Router();

router.post(
    '/parse',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    DocumentAiController.parseDocument
);

export const DocumentAiRoutes = router;
