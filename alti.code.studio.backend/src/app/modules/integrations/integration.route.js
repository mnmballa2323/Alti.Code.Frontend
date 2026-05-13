/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import express from 'express';
import { IntegrationController } from './integration.controller.js';

const router = express.Router();

router.post('/trigger', IntegrationController.handleTrigger);

export const integrationRoutes = router;
