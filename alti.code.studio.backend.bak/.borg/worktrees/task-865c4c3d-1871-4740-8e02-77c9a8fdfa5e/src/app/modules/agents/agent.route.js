/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import express from 'express';
// import auth from '../../middlewares/auth.js';
// import { USER_ROLE } from '../user/user.constant.js';
import { AgentController } from './agent.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Agents
 *   description: AI Agent Orchestration
 */

/**
 * @swagger
 * /agents/mission:
 *   post:
 *     summary: Start a new agent mission
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goal
 *             properties:
 *               goal:
 *                 type: string
 *                 example: "Build a landing page for a coffee shop"
 *     responses:
 *       200:
 *         description: Mission started successfully
 */
// Temporarily open for testing without auth middleware complexities
// router.post('/mission', auth(USER_ROLE.USER), AgentController.startMission);
router.post('/mission', AgentController.startMission);

/**
 * @swagger
 * /agents/chaos:
 *   post:
 *     summary: Toggle Chaos Mode
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Chaos mode updated
 */
router.post('/chaos', AgentController.toggleChaos);

router.get('/status', AgentController.getAgentStatus);

export const AgentRoutes = router;
