import express from 'express';
import { GuardianController } from './guardian.controller.js';

const router = express.Router();

router.post('/audit', GuardianController.audit);

export const guardianRoutes = router;
