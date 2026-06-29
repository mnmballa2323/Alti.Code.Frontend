/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { graphOrchestrator } from './graph.orchestrator.js';
import { logger } from '../../../shared/logger.js';
import { puppeteerAgent } from './puppeteer.agent.js';
import { cloudBatchService } from '../gcpCloud/gcpBatch.service.js';
import { hermesAgentBridge } from './hermes.agent.js';
import { CustomAgentService } from './customAgent.service.js';

const startMission = catchAsync(async (req, res) => {
  const { goal } = req.body;
  const sessionId = `mission-${Date.now()}`;
  const userId = req.user?.id || 'anonymous';

  if (!goal) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Goal is required');
  }

  logger.info(`🚀 API: Starting mission for user ${userId}: ${goal}`);

  // Run in background (don't await full completion if long-running)
  // For now, we await to return results simply
  const results = await graphOrchestrator.run(goal);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Mission executed successfully',
    data: results,
  });
});

const getAgentStatus = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Agent System Operational',
    data: {
      orchestrator: 'active',
      tools: [
        'surfer',
        'vector',
        'siren',
        'opencode',
        'openspec',
        'website_cloner',
      ],
    },
  });
});

export const AgentController = {
  startMission,
  toggleChaos: (req, res) => {
    logger.info('🕹️ API: toggleChaos Request received', { body: req.body });

    try {
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        logger.warn('⚠️ Invalid input for toggleChaos');
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid input: 'enabled' must be a boolean",
        });
      }

      global.CHAOS_MODE = enabled;
      logger.info(`🔥 Global Chaos Mode set to: ${global.CHAOS_MODE}`);

      res.status(httpStatus.OK).json({
        success: true,
        message: `Chaos Mode set to ${global.CHAOS_MODE}`,
      });
    } catch (error) {
      logger.error('❌ Error in toggleChaos:', error);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error',
      });
    }
  },
  getAgentStatus,
  exploreUrl: catchAsync(async (req, res) => {
    const { url } = req.body;
    if (!url)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ success: false, message: 'URL required' });

    const content = await puppeteerAgent.scrapeRenderedContext(url);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Web exploration completed successfully',
      data: { content },
    });
  }),
  allocateComputeCluster: catchAsync(async (req, res) => {
    const { jobId, dockerImage, commands } = req.body;

    if (!jobId || !dockerImage || !commands) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'jobId, dockerImage, and commands required',
      });
    }

    const result = await cloudBatchService.submitComputeJob(
      jobId,
      dockerImage,
      commands,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Compute cluster allocation initiated',
      data: result,
    });
  }),
  triggerHermes: catchAsync(async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ success: false, message: 'Prompt is required' });
    }

    const output = await hermesAgentBridge.executeTask(prompt);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Hermes Agent task completed',
      data: { output },
    });
  }),

  getCustomAgents: catchAsync(async (req, res) => {
    const userId = req.user?._id || req.user?.id || 'anonymous';
    const agents = CustomAgentService.getAgents(userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Custom agents fetched successfully.',
      data: agents,
    });
  }),

  createCustomAgent: catchAsync(async (req, res) => {
    const userId = req.user?._id || req.user?.id || 'anonymous';
    const { name, description, prompt, tools } = req.body;

    if (!name) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Agent name is required.',
      });
    }

    const newAgent = CustomAgentService.createAgent({
      name,
      description,
      prompt,
      tools,
      userId,
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Custom Agent registered successfully.',
      data: newAgent,
    });
  }),

  deleteCustomAgent: catchAsync(async (req, res) => {
    const userId = req.user?._id || req.user?.id || 'anonymous';
    const { agentId } = req.params;

    const success = CustomAgentService.deleteAgent(agentId, userId);

    if (!success) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Custom Agent not found or not owned by user.',
      });
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Custom Agent deleted successfully.',
      data: null,
    });
  }),
};
