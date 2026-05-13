import express from 'express';
import { governorController } from './governance.controller.js';

const router = express.Router();

router.post('/enforce', governorController.enforcePolicy);
router.get('/licenses', governorController.auditLicenses);
router.post('/report', governorController.generateReport);

export const governorRoutes = router;
