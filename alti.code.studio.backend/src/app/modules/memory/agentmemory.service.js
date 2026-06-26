/**
 * AgentMemory Integration Service
 *
 * Integrates rohitg00/agentmemory (https://github.com/rohitg00/agentmemory)
 * as the #1 persistent memory layer for AI coding agents.
 *
 * Architecture:
 *   - The agentmemory server runs as a standalone process (port 3111)
 *   - This service acts as a REST client proxying requests to it
 *   - Start it externally: `npx @agentmemory/agentmemory`
 *   - If the server is not reachable, the backend degrades gracefully
 *
 * Features:
 *   - Triple-stream recall: BM25 + Vector + Knowledge Graph
 *   - 95.2% R@5 on LongMemEval-S benchmark
 *   - 12 auto-capture hooks, 51 MCP tools, 121 REST endpoints
 *   - Knowledge graph extraction, session replay, GDPR compliance
 *
 * License: Apache-2.0 (agentmemory) | MIT (this integration)
 */

import { logger } from '../../../shared/logger.js';
import axios from 'axios';

class AgentMemoryService {
  constructor() {
    this.isReady = false;
    this.baseUrl = `http://127.0.0.1:${process.env.AGENTMEMORY_PORT || 3111}`;
    this.healthEndpoint = `${this.baseUrl}/agentmemory/health`;
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.AGENTMEMORY_SECRET
          ? { Authorization: `Bearer ${process.env.AGENTMEMORY_SECRET}` }
          : {}),
      },
    });

    // Health poll interval handle
    this._healthPollInterval = null;
  }

  /**
   * Initialize the AgentMemory client.
   * Checks if the agentmemory server is running and starts polling.
   */
  async init() {
    logger.info(
      '[AgentMemory] 🧠 Initializing AgentMemory Client — Persistent Memory for AI Coding Agents...',
    );
    logger.info(`[AgentMemory]    Connecting to: ${this.baseUrl}`);

    try {
      await this._checkHealth();
      this.isReady = true;
      logger.info('[AgentMemory] ✅ AgentMemory server is LIVE and healthy.');
      logger.info(`[AgentMemory]    REST API:  ${this.baseUrl}/agentmemory/*`);
      logger.info(`[AgentMemory]    Viewer:    http://127.0.0.1:3113`);
    } catch {
      this.isReady = false;
      logger.warn('[AgentMemory] ⚠️ AgentMemory server is not reachable.');
      logger.warn(
        '[AgentMemory]    To enable persistent agent memory, run in a separate terminal:',
      );
      logger.warn('[AgentMemory]    $ npx @agentmemory/agentmemory');
      logger.warn(
        '[AgentMemory]    The backend will continue without agent memory and auto-connect when available.',
      );
    }

    // Start background health polling (auto-reconnect)
    this._startHealthPoll();
  }

  /**
   * Background health poll — auto-detects when agentmemory comes online/offline.
   */
  _startHealthPoll() {
    if (this._healthPollInterval) return;

    this._healthPollInterval = setInterval(async () => {
      try {
        await this._checkHealth();
        if (!this.isReady) {
          this.isReady = true;
          logger.info(
            '[AgentMemory] ✅ AgentMemory server detected! Persistent memory is now ACTIVE.',
          );
        }
      } catch {
        if (this.isReady) {
          this.isReady = false;
          logger.warn(
            '[AgentMemory] ⚠️ AgentMemory server went offline. Memory operations will return empty results.',
          );
        }
      }
    }, 30000); // Poll every 30 seconds
  }

  /**
   * Check the health endpoint.
   */
  async _checkHealth() {
    const res = await axios.get(this.healthEndpoint, { timeout: 3000 });
    if (res.status !== 200) throw new Error('Health check failed');
    return res.data;
  }

  /**
   * Helper: run a request against agentmemory with graceful fallback.
   */
  async _request(method, path, data = null, params = {}) {
    if (!this.isReady) {
      return {
        status: 'unavailable',
        message:
          'AgentMemory server is not running. Start it with: npx @agentmemory/agentmemory',
      };
    }

    try {
      const res = await this.httpClient.request({
        method,
        url: path,
        data,
        params,
        timeout: 30000,
      });
      return res.data;
    } catch (err) {
      logger.error(
        `[AgentMemory] Request failed: ${method} ${path} — ${err.message}`,
      );
      throw err;
    }
  }

  // ─── Core Memory Operations ─────────────────────────────────────────────

  /** Check server health */
  async health() {
    return this._request('GET', '/agentmemory/health');
  }

  /**
   * Save an observation to agent memory.
   * Captures tool uses, code changes, decisions.
   * @param {Object} observation - { content, type?, project?, metadata? }
   */
  async observe(observation) {
    return this._request('POST', '/agentmemory/observe', observation);
  }

  /**
   * Save a structured memory explicitly.
   * @param {Object} memory - { content, type?, project?, tags? }
   */
  async remember(memory) {
    return this._request('POST', '/agentmemory/remember', memory);
  }

  /**
   * Triple-stream recall: BM25 + Vector + Knowledge Graph.
   * P50 under 20ms on laptop hardware.
   * @param {Object} query - { query, project?, limit?, threshold? }
   */
  async smartSearch(query) {
    return this._request('POST', '/agentmemory/smart-search', query);
  }

  /**
   * Get project context for a new session (auto-injected memories).
   * @param {Object} params - { project?, token_budget? }
   */
  async getContext(params = {}) {
    return this._request('POST', '/agentmemory/context', params);
  }

  /**
   * Start a new agent session.
   * @param {Object} session - { project?, metadata? }
   */
  async startSession(session = {}) {
    return this._request('POST', '/agentmemory/session/start', session);
  }

  /**
   * End an agent session (triggers summarization + graph extraction).
   * @param {Object} session - { session_id?, summary? }
   */
  async endSession(session = {}) {
    return this._request('POST', '/agentmemory/session/end', session);
  }

  /**
   * Forget a specific memory (GDPR/governance compliant delete with audit trail).
   * @param {Object} params - { id?, query? }
   */
  async forget(params) {
    return this._request('POST', '/agentmemory/forget', params);
  }

  /**
   * Query the knowledge graph.
   * @param {Object} query - { query?, entity?, depth? }
   */
  async graphQuery(query) {
    return this._request('POST', '/agentmemory/graph/query', query);
  }

  /**
   * Get the project profile (top concepts, files, patterns).
   * @param {string} project - Project name
   */
  async getProfile(project) {
    return this._request('GET', '/agentmemory/profile', null, { project });
  }

  /**
   * Export all memories for a project.
   * @param {string} project - Project name
   */
  async exportMemories(project) {
    return this._request('GET', '/agentmemory/export', null, { project });
  }

  /**
   * Import memories from an export payload.
   * @param {Object} payload - The export data
   */
  async importMemories(payload) {
    return this._request('POST', '/agentmemory/import', payload);
  }

  /**
   * Get the audit trail.
   */
  async getAudit() {
    return this._request('GET', '/agentmemory/audit');
  }

  /**
   * Enrich a file-touching tool call with relevant context.
   * @param {Object} params - { file_path, tool_name?, project? }
   */
  async enrich(params) {
    return this._request('POST', '/agentmemory/enrich', params);
  }

  /**
   * Generic proxy: forward any request to agentmemory's REST API.
   * Used by the Express proxy router for full passthrough.
   */
  async proxy(method, urlPath, data = null, params = {}) {
    return this._request(method, urlPath, data, params);
  }

  /**
   * Gracefully cleanup.
   */
  async shutdown() {
    if (this._healthPollInterval) {
      clearInterval(this._healthPollInterval);
      this._healthPollInterval = null;
    }
    logger.info('[AgentMemory] Client shutdown complete.');
  }
}

export const agentMemoryService = new AgentMemoryService();
export default agentMemoryService;
