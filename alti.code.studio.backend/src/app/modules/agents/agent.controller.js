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
import { prismaClient } from '../../platform/db/prismaClient.js';
import { puppeteerAgent } from './puppeteer.agent.js';
import { cloudBatchService } from '../gcpCloud/gcpBatch.service.js';
import { hermesAgentBridge } from './hermes.agent.js';
import { CustomAgentService } from './customAgent.service.js';

const startMission = catchAsync(async (req, res) => {
  const { goal } = req.body;
  const sessionId = `mission-${Date.now()}`;
  const userId = req.user?.id || req.user?._id || 'anonymous';
  const prisma = prismaClient.prisma;

  if (!goal) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Goal is required',
    });
  }

  // Pre-mission quota & budget check
  if (userId && userId !== 'anonymous') {
    try {
      const billing = await prisma.userBilling.findUnique({
        where: { userId },
      });

      if (billing) {
        // Enforce hard spend budget limit
        if (billing.currentSpendUsd >= billing.monthlyBudgetUsd && billing.hardLimitAction === 'pause') {
          return res.status(httpStatus.PAYMENT_REQUIRED).json({
            success: false,
            message: 'Monthly compute budget limit reached. Please increase your budget limit.',
          });
        }

        // Enforce token balance limit
        if (billing.activePlan === 'free' && billing.tokenBalance <= 0) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user && user.promptsUsed >= 100) {
            return res.status(httpStatus.PAYMENT_REQUIRED).json({
              success: false,
              message: 'Free tier prompt limit (100) reached. Please upgrade to Pro.',
            });
          }
        }
      }
    } catch (err) {
      logger.warn(`⚠️ Billing check skipped due to DB connection: ${err.message}`);
    }
  }

  logger.info(`🚀 API: Starting mission for user ${userId}: ${goal}`);

  const results = await graphOrchestrator.run(goal);

  // Post-mission token deduction & spend ledger updates
  if (userId && userId !== 'anonymous') {
    try {
      const tokensSpent = 2500; // Mock average 2.5k tokens spent per agent loop
      const costUsd = 0.05; // Mock average $0.05 cost
      
      await prisma.$transaction([
        prisma.userBilling.update({
          where: { userId },
          data: {
            tokenBalance: { decrement: tokensSpent },
            currentSpendUsd: { increment: costUsd },
          },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            promptsUsed: { increment: 1 },
          },
        }),
      ]);
    } catch (err) {
      logger.warn(`⚠️ Post-mission billing updates skipped: ${err.message}`);
    }
  }

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
