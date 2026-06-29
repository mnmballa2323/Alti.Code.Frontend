/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * Engine Controller
 * Manages list and execution of the 216 specialist workspace engines.
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import ApiError from '../../../errors/ApiError.js';
import { agentRegistry } from './agent.registry.js';
import { OpenCodeAgentService } from '../openCodeAgent/openCodeAgent.service.js';
import { OpenSpecAgentService } from '../openSpecAgent/openSpecAgent.service.js';
import { AiWebsiteClonerService } from '../aiWebsiteCloner/aiWebsiteCloner.service.js';
import { graphOrchestrator } from './graph.orchestrator.js';
import { logger } from '../../../shared/logger.js';

const listRegisteredEngines = catchAsync(async (req, res) => {
  const list = agentRegistry.list().map(a => ({
    name: a.name,
    description: a.description,
    capabilities: a.capabilities,
    queue: a.queue,
    version: a.version,
    isPlugin: !!a.isPlugin,
  }));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Engines retrieved successfully',
    data: list,
  });
});

const triggerEngineTask = catchAsync(async (req, res) => {
  const { engineId } = req.params;
  const { action, args = {} } = req.body;

  if (!engineId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Engine ID is required');
  }

  logger.info(
    `🚀 Engine Trigger: Executing ${engineId}.${action || 'default'} with args:`,
    args,
  );

  let result = null;

  // Route to specific services if matched, otherwise fallback to generic orchestration
  if (engineId === 'opencode') {
    if (action === 'runTask') {
      result = await OpenCodeAgentService.runTask(
        args.task || args.query,
        args.workspace,
      );
    } else if (action === 'getTaskStatus') {
      result = await OpenCodeAgentService.getTaskStatus(args.sessionId);
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Unsupported action '${action}' for opencode`,
      );
    }
  } else if (engineId === 'openspec') {
    if (action === 'init') {
      result = await OpenSpecAgentService.init(args.workspace);
    } else if (action === 'propose') {
      result = await OpenSpecAgentService.propose(args.name, args.workspace);
    } else if (action === 'list') {
      result = await OpenSpecAgentService.list(args.workspace);
    } else if (action === 'validate') {
      result = await OpenSpecAgentService.validate(args.workspace);
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Unsupported action '${action}' for openspec`,
      );
    }
  } else if (engineId === 'website_cloner') {
    if (action === 'clone' || action === 'prepareClonerTemplate') {
      result = await AiWebsiteClonerService.prepareClonerTemplate(
        args.targetUrl || args.url,
        args.projectName || args.name,
        args.workspace,
      );
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Unsupported action '${action}' for website_cloner`,
      );
    }
  } else {
    // Fallback: Dispatch a single-node graph step using the Orchestrator for the generic agent
    logger.info(
      `🔄 Engine Trigger: Dispatching generic step via graph orchestrator for ${engineId}`,
    );
    result = await graphOrchestrator.run(
      `Run task using agent ${engineId}: ${args.task || args.query || 'execute default'}`,
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Engine task executed successfully',
    data: result,
  });
});

export const EngineController = {
  listRegisteredEngines,
  triggerEngineTask,
};
