/**
 * Copyright (c) 2026 Inso Code
 *
 * function.route.js — API routes for Serverless Functions Center.
 */

import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { FunctionController } from './function.controller.js';

const router = express.Router();

router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  FunctionController.createFunction,
);

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  FunctionController.getFunctions,
);

router.put(
  '/:functionId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  FunctionController.updateFunction,
);

router.delete(
  '/:functionId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  FunctionController.deleteFunction,
);

router.post(
  '/execute',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  FunctionController.executeFunction,
);

export const functionRoutes = router;
