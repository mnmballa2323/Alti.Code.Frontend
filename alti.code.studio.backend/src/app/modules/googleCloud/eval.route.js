import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { EvalController } from './eval.controller.js';

const router = express.Router();

router.post(
    '/evaluate',
    auth(ENUM_USER_ROLE.ADMIN),
    EvalController.evaluateOutput
);

export const EvalRoutes = router;
