import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { aiService } from './ai.service.js';
import { agentRegistry } from '../agents/agent.registry.js';
import { AgentMemoryHooks } from '../memory/agentmemory.hooks.js';

import { swarmBrain } from '../agents/swarm_brain.js';

const executeTask = catchAsync(async (req, res) => {
  const { prompt, context = [] } = req.body;
  const userId = req.user?.id || req.user?.userId || 'anonymous';

  if (!prompt) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'Prompt is required',
    });
  }

  // 🧠 AgentMemory: Start session for this user interaction
  const sessionData = await AgentMemoryHooks.startSession(
    userId,
    'alti-code-studio',
    {
      source: 'api',
      promptPreview: prompt.substring(0, 100),
    },
  );

  // Set headers for Server-Sent Events (SSE)
  res.writeHead(httpStatus.OK, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Send an initial handshake event (include memory session info)
  res.write(
    `data: ${JSON.stringify({
      status: 'connected',
      message: 'SSE Connection Established',
      memorySession: sessionData?.sessionId || null,
    })}\n\n`,
  );

  const onProgress = payload => {
    // Only write if connection is still open
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

  try {
    const userOptions = {
      preferredCloud: req.user?.preferredCloud || 'gcp',
      preferredModel: req.user?.preferredModel || 'gemini-3.5-pro',
    };
    await swarmBrain.executeTask(prompt, context, onProgress, userOptions);

    // 🧠 AgentMemory: End session — triggers summarization + graph extraction
    AgentMemoryHooks.endSession(
      userId,
      `Task completed: ${prompt.substring(0, 200)}`,
    ).catch(() => {});

    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ status: 'DONE' })}\n\n`);
      res.end();
    }
  } catch (error) {
    // 🧠 AgentMemory: Capture the failure and end session
    AgentMemoryHooks.captureToolFailure('swarmBrain', prompt, error).catch(
      () => {},
    );
    AgentMemoryHooks.endSession(userId, `Task failed: ${error.message}`).catch(
      () => {},
    );

    if (!res.writableEnded) {
      res.write(
        `data: ${JSON.stringify({ status: 'ERROR', message: error.message })}\n\n`,
      );
      res.end();
    }
  }
});

const createWorkflow = catchAsync(async (req, res) => {
  const userId = req.user?.userId || '000000000000000000000000'; // Fallback for testing if no auth
  const workflow = await aiService.createWorkflow(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Workflow created successfully',
    data: workflow,
  });
});

const executeWorkflow = catchAsync(async (req, res) => {
  const { id } = req.params;
  // We do NOT await the execution loop here because it's a long-running background task!
  // We trigger it and immediately return 202 Accepted.
  aiService.executeWorkflow(id).catch(console.error);

  sendResponse(res, {
    statusCode: httpStatus.ACCEPTED,
    success: true,
    message: 'Workflow execution triggered in background',
    data: { workflowId: id },
  });
});

const getWorkflowRuns = catchAsync(async (req, res) => {
  const { id } = req.params;
  const runs = await aiService.getWorkflowRuns(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Workflow runs fetched successfully',
    data: runs,
  });
});

const getAgents = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Agents retrieved successfully',
    data: agentRegistry.toJSON(),
  });
});

export const AiController = {
  executeTask,
  createWorkflow,
  executeWorkflow,
  getWorkflowRuns,
  getAgents,
};
