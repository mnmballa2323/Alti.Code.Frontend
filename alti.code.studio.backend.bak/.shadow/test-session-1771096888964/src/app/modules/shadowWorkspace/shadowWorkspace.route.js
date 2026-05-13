import express from 'express';
import { ShadowWorkspaceController } from './shadowWorkspace.controller.js';

const router = express.Router();

router.post('/init', ShadowWorkspaceController.initShadow);
router.post('/apply', ShadowWorkspaceController.applyDiff);
router.post('/run', ShadowWorkspaceController.runCommand);
router.post('/commit', ShadowWorkspaceController.commitShadow);


export const shadowWorkspaceRoutes = router;
