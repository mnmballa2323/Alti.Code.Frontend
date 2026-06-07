/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { CodeEditorController } from './codeEditor.controller.js';

import { FileSystemController } from './filesystem.controller.js';

const router = express.Router();

router.post('/open-folder', CodeEditorController.openFolder);
router.post('/exec', CodeEditorController.runCommand);
router.post('/fs', FileSystemController.handleFsAction);

export const codeEditorRoutes = router;
