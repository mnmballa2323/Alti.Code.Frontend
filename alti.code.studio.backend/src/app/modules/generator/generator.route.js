/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { GeneratorController } from './generator.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
    '/project',
    authMiddleware('user', 'developer', 'admin', 'owner'),
    GeneratorController.generateProject
);
<<<<<<< HEAD
=======
router.post(
    '/app',
    authMiddleware('user', 'developer', 'admin', 'owner'),
    GeneratorController.generateProject
);
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
router.post('/refine', authMiddleware('user', 'developer', 'admin', 'owner'), GeneratorController.refine);

export const generatorRoutes = router;
