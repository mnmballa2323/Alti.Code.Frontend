import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { RulesController } from './rules.controller.js';

const router = express.Router();

const protect =
  process.env.NODE_ENV === 'production'
    ? auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER)
    : (req, res, next) => next();

router.get('/', protect, RulesController.getRules);

router.post('/', protect, RulesController.updateRules);

export const rulesRoutes = router;
