/**
 * AgentMemory Routes
 *
 * Express router for AgentMemory — the #1 persistent memory
 * for AI coding agents. Exposes all core memory operations
 * under /api/v1/agent-memory/*.
 *
 * Powered by: https://github.com/rohitg00/agentmemory
 * Docs: https://www.agent-memory.dev/
 */

import express from 'express';
import { AgentMemoryController } from './agentmemory.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AgentMemory
 *   description: |
 *     Persistent memory for AI coding agents.
 *     Triple-stream recall (BM25 + Vector + Knowledge Graph).
 *     95.2% R@5 on LongMemEval-S benchmark.
 */

// ── Health ────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/health:
 *   get:
 *     summary: Check AgentMemory server health
 *     tags: [AgentMemory]
 *     responses:
 *       200:
 *         description: AgentMemory server is healthy
 *       503:
 *         description: AgentMemory server is not running
 */
router.get('/health', AgentMemoryController.health);

// ── Write Operations ──────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/observe:
 *   post:
 *     summary: Capture an observation (tool use, code change, decision)
 *     tags: [AgentMemory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The raw observation text
 *               type:
 *                 type: string
 *                 enum: [tool_use, code_change, decision, error, pattern]
 *               project:
 *                 type: string
 *     responses:
 *       201:
 *         description: Observation recorded
 */
router.post('/observe', AgentMemoryController.observe);

/**
 * @swagger
 * /api/v1/agent-memory/remember:
 *   post:
 *     summary: Explicitly save a structured memory
 *     tags: [AgentMemory]
 */
router.post('/remember', AgentMemoryController.remember);

// ── Read Operations ───────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/smart-search:
 *   post:
 *     summary: Triple-stream recall - BM25 + Vector + Knowledge Graph
 *     tags: [AgentMemory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: Semantic search query
 *               project:
 *                 type: string
 *               limit:
 *                 type: integer
 *                 default: 10
 *     responses:
 *       200:
 *         description: Search results with relevance scores
 */
router.post('/smart-search', AgentMemoryController.smartSearch);

/**
 * @swagger
 * /api/v1/agent-memory/context:
 *   post:
 *     summary: Get auto-injected project context for a new agent session
 *     tags: [AgentMemory]
 */
router.post('/context', AgentMemoryController.getContext);

/**
 * @swagger
 * /api/v1/agent-memory/profile:
 *   get:
 *     summary: Get project profile (top concepts, files, patterns)
 *     tags: [AgentMemory]
 *     parameters:
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 */
router.get('/profile', AgentMemoryController.getProfile);

// ── Session Management ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/session/start:
 *   post:
 *     summary: Start a new agent session
 *     tags: [AgentMemory]
 */
router.post('/session/start', AgentMemoryController.startSession);

/**
 * @swagger
 * /api/v1/agent-memory/session/end:
 *   post:
 *     summary: End session (triggers summarization + graph extraction)
 *     tags: [AgentMemory]
 */
router.post('/session/end', AgentMemoryController.endSession);

// ── Knowledge Graph ───────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/graph/query:
 *   post:
 *     summary: Query the knowledge graph
 *     tags: [AgentMemory]
 */
router.post('/graph/query', AgentMemoryController.graphQuery);

// ── Governance & Compliance ───────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/forget:
 *   post:
 *     summary: GDPR-compliant memory deletion with audit trail
 *     tags: [AgentMemory]
 */
router.post('/forget', AgentMemoryController.forget);

/**
 * @swagger
 * /api/v1/agent-memory/audit:
 *   get:
 *     summary: Get the audit trail of all memory operations
 *     tags: [AgentMemory]
 */
router.get('/audit', AgentMemoryController.getAudit);

// ── Data Portability ──────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/export:
 *   get:
 *     summary: Export all memories for a project
 *     tags: [AgentMemory]
 */
router.get('/export', AgentMemoryController.exportMemories);

/**
 * @swagger
 * /api/v1/agent-memory/import:
 *   post:
 *     summary: Import memories from export payload
 *     tags: [AgentMemory]
 */
router.post('/import', AgentMemoryController.importMemories);

// ── Context Enrichment ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/enrich:
 *   post:
 *     summary: Enrich a file-touching tool call with relevant context
 *     tags: [AgentMemory]
 */
router.post('/enrich', AgentMemoryController.enrich);

// ── Full Proxy (catch-all for all 121 REST endpoints) ─────────────────────
/**
 * @swagger
 * /api/v1/agent-memory/proxy/{path}:
 *   all:
 *     summary: Passthrough proxy to any agentmemory REST endpoint
 *     tags: [AgentMemory]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 */
router.all('/proxy/*', AgentMemoryController.proxy);

export const agentMemoryRoutes = router;
