/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { GuardianController } from './guardian.controller.js';

const router = express.Router();

router.post('/audit', GuardianController.audit);

export const guardianRoutes = router;
