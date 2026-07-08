/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
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

/**
 * @swagger
 * /agents/status:
 *   get:
 *     summary: Retrieve aggregate status of the Swarm Agents
 *     description: Returns the active mission and chaos toggle state of the backend AI orchestrators.
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: Current agent system status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                 activeMission:
 *                   type: string
 *                 chaosMode:
 *                   type: boolean
 */
router.get('/status', AgentController.getAgentStatus);

/**
 * @swagger
 * /agents/explore:
 *   post:
 *     summary: Trigger Autonomous Puppeteer Web Scraper
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Web exploration completed
 */
router.post('/explore', AgentController.exploreUrl);

/**
 * @swagger
 * /agents/batch:
 *   post:
 *     summary: Allocate Autonomous Compute Cluster via Google Cloud Batch
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *               dockerImage:
 *                 type: string
 *               commands:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Compute cluster allocation initiated
 */
router.post('/batch', AgentController.allocateComputeCluster);

/**
 * @swagger
 * /agents/hermes:
 *   post:
 *     summary: Trigger the Sovereign Hermes AI Coder
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hermes agent executed successfully
 */
router.post('/hermes', AgentController.triggerHermes);

router.get('/custom', AgentController.getCustomAgents);
router.post('/custom', AgentController.createCustomAgent);
router.delete('/custom/:agentId', AgentController.deleteCustomAgent);

export const AgentRoutes = router;
