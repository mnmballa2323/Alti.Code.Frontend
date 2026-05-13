/**
 * AgentMemory Controller
 * 
 * REST controller that proxies requests to the AgentMemory server
 * and exposes first-class endpoints for the Alti.Code.Studio frontend.
 * 
 * All endpoints are under /api/v1/agent-memory/*
 */

import { agentMemoryService } from './agentmemory.service.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';

export class AgentMemoryController {
  /**
   * GET /api/v1/agent-memory/health
   * Health check for the agentmemory sub-system.
   */
  static health = catchAsync(async (req, res) => {
    if (!agentMemoryService.isReady) {
      return sendResponse(res, {
        statusCode: httpStatus.SERVICE_UNAVAILABLE,
        success: false,
        message: 'AgentMemory server is not running',
        data: { status: 'DOWN', isReady: false },
      });
    }

    const health = await agentMemoryService.health();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'AgentMemory is healthy',
      data: health,
    });
  });

  /**
   * POST /api/v1/agent-memory/observe
   * Capture an observation (tool use, code change, decision).
   */
  static observe = catchAsync(async (req, res) => {
    const result = await agentMemoryService.observe(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Observation recorded in agent memory',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/remember
   * Explicitly save a structured memory.
   */
  static remember = catchAsync(async (req, res) => {
    const result = await agentMemoryService.remember(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Memory saved successfully',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/smart-search
   * Triple-stream recall: BM25 + Vector + Knowledge Graph.
   */
  static smartSearch = catchAsync(async (req, res) => {
    const result = await agentMemoryService.smartSearch(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Smart search completed',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/context
   * Get auto-injected project context for a new agent session.
   */
  static getContext = catchAsync(async (req, res) => {
    const result = await agentMemoryService.getContext(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Context retrieved',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/session/start
   * Start a new agent session.
   */
  static startSession = catchAsync(async (req, res) => {
    const result = await agentMemoryService.startSession(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Agent session started',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/session/end
   * End a session (triggers summarization + knowledge graph extraction).
   */
  static endSession = catchAsync(async (req, res) => {
    const result = await agentMemoryService.endSession(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Agent session ended. Memories consolidated.',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/forget
   * GDPR-compliant memory deletion with audit trail.
   */
  static forget = catchAsync(async (req, res) => {
    const result = await agentMemoryService.forget(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Memory forgotten (audit record created)',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/graph/query
   * Query the knowledge graph.
   */
  static graphQuery = catchAsync(async (req, res) => {
    const result = await agentMemoryService.graphQuery(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Knowledge graph query completed',
      data: result,
    });
  });

  /**
   * GET /api/v1/agent-memory/profile
   * Get the project profile (top concepts, files, patterns).
   */
  static getProfile = catchAsync(async (req, res) => {
    const result = await agentMemoryService.getProfile(req.query.project);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Project profile retrieved',
      data: result,
    });
  });

  /**
   * GET /api/v1/agent-memory/export
   * Export all memories for a project.
   */
  static exportMemories = catchAsync(async (req, res) => {
    const result = await agentMemoryService.exportMemories(req.query.project);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Memories exported',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/import
   * Import memories from an export payload.
   */
  static importMemories = catchAsync(async (req, res) => {
    const result = await agentMemoryService.importMemories(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Memories imported successfully',
      data: result,
    });
  });

  /**
   * GET /api/v1/agent-memory/audit
   * Get the audit trail of all memory operations.
   */
  static getAudit = catchAsync(async (req, res) => {
    const result = await agentMemoryService.getAudit();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Audit trail retrieved',
      data: result,
    });
  });

  /**
   * POST /api/v1/agent-memory/enrich
   * Enrich a file-touching tool call with relevant context.
   */
  static enrich = catchAsync(async (req, res) => {
    const result = await agentMemoryService.enrich(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'File context enriched',
      data: result,
    });
  });

  /**
   * ALL /api/v1/agent-memory/proxy/*
   * Full passthrough proxy to agentmemory's raw REST API.
   * Any path under /agentmemory/* can be reached via this route.
   */
  static proxy = catchAsync(async (req, res) => {
    const proxyPath = `/agentmemory/${req.params[0] || ''}`;
    const result = await agentMemoryService.proxy(
      req.method,
      proxyPath,
      req.body && Object.keys(req.body).length > 0 ? req.body : null,
      req.query,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Proxy response from ${proxyPath}`,
      data: result,
    });
  });
}
