import express from 'express';
import { dispatchWorkflow, deployWorkflow } from './workflow.controller.js';

export const workflowRoutes = express.Router();

workflowRoutes.post('/dispatch', dispatchWorkflow);
workflowRoutes.post('/deploy', deployWorkflow);
