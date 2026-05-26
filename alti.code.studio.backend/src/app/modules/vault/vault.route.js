import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { VaultController } from './vault.controller.js';

const router = express.Router();

const protect = process.env.NODE_ENV === 'production' 
  ? auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER) 
  : (req, res, next) => next();

router.get(
  '/keys',
  protect,
  VaultController.getKeys
);

router.post(
  '/keys',
  protect,
  VaultController.updateKeys
);

export const vaultRoutes = router;
