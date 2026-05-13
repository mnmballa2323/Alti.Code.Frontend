import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { TasksController } from './tasks.controller.js';

const router = express.Router();

router.post(
    '/dispatch',
    auth(ENUM_USER_ROLE.ADMIN),
    TasksController.dispatchTask
);

export const TasksRoutes = router;
