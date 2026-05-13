/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { AutomationController } from './automations.controller.js';

const router = express.Router();

router.post('/fetch-leads', AutomationController.fetchAndSaveLeads);

export const automationRoutes = router;
