import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { CodeAssistController } from './codeAssist.controller.js';

const router = express.Router();

router.post(
    '/refactor',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    CodeAssistController.performStructuralRefactor
);

export const CodeAssistRoutes = router;
