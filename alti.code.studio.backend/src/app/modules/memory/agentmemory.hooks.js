/**
 * AgentMemory Hooks — The Neural Cortex
 * 
 * Deep integration hooks that wire AgentMemory into every layer
 * of the Inso Code agent execution pipeline.
 * 
 * This module implements the 12-hook capture pattern from agentmemory:
 *   - SessionStart / SessionEnd
 *   - PreToolUse / PostToolUse / PostToolUseFailure
 *   - UserPromptSubmit
 *   - SubagentStart / SubagentStop
 *   - PreCompact
 * 
 * Every agent interaction flows through these hooks automatically,
 * building a persistent semantic memory that accumulates across sessions.
 * 
 * Architecture:
 *   - Express middleware for automatic request/response capture
 *   - Direct integration points for SwarmBrain, Orchestrator, CapabilityRouter
 *   - SHA-256 dedup with 5-minute window (matches agentmemory's native dedup)
 *   - Privacy filter: strips API keys, JWT tokens, and secrets before storage
 * 
 * Powered by: https://github.com/rohitg00/agentmemory (Apache-2.0)
 */

import fs from 'fs/promises';
import path from 'path';
import { agentMemoryService } from './agentmemory.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

// ── SHA-256 Dedup Window (5 minutes) ──────────────────────────────────────
const DEDUP_WINDOW_MS = 5 * 60 * 1000;
const recentHashes = new Map(); // hash → timestamp

function isDuplicate(content) {
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const now = Date.now();
    
    // Clean expired entries
    for (const [h, ts] of recentHashes) {
        if (now - ts > DEDUP_WINDOW_MS) recentHashes.delete(h);
    }
    
    if (recentHashes.has(hash)) return true;
    recentHashes.set(hash, now);
    return false;
}

// ── Privacy Filter ────────────────────────────────────────────────────────
const SENSITIVE_PATTERNS = [
    /(?:sk-|AIza|ghp_|gho_|glpat-|xoxb-|xoxp-)[A-Za-z0-9_-]{20,}/g,  // API keys
    /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // JWT tokens
    /(?:password|secret|token|api_key|apikey)\s*[:=]\s*['"]?[^\s'"]{8,}/gi, // Key-value secrets
    /-----BEGIN (?:RSA |EC |PRIVATE )?KEY-----[\s\S]*?-----END/g,       // PEM keys
];

function sanitize(text) {
    if (!text || typeof text !== 'string') return text;
    let sanitized = text;
    for (const pattern of SENSITIVE_PATTERNS) {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    return sanitized;
}

// ── Session Management ────────────────────────────────────────────────────
const activeSessions = new Map(); // userId → sessionId

class AgentMemoryHooks {
    
    // ═══════════════════════════════════════════════════════════════════
    // SESSION LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Start an agent session. Called when a user initiates a new chat/task.
     * Triggers agentmemory's SessionStart hook → loads project profile,
     * hybrid search, token budget, and injects context into conversation.
     */
    static async startSession(userId, project = 'alti-code-studio', metadata = {}) {
        if (!agentMemoryService.isReady) return null;
        
        try {
            const result = await agentMemoryService.startSession({
                project,
                metadata: {
                    userId,
                    platform: 'alti-code-studio',
                    timestamp: new Date().toISOString(),
                    ...metadata,
                }
            });
            
            const sessionId = result?.session_id || `session_${Date.now()}`;
            activeSessions.set(userId, sessionId);
            
            logger.info(`[AgentMemory:Hook] 🟢 SessionStart: User ${userId} → Session ${sessionId}`);
            return { sessionId, context: result };
        } catch (err) {
            logger.warn(`[AgentMemory:Hook] SessionStart failed: ${err.message}`);
            return null;
        }
    }
    
    /**
     * End an agent session. Called when user closes chat or after timeout.
     * Triggers: summarization → knowledge graph extraction → slot reflection.
     */
    static async endSession(userId, summary = '') {
        if (!agentMemoryService.isReady) return null;
        
        const sessionId = activeSessions.get(userId);
        if (!sessionId) return null;
        
        try {
            const result = await agentMemoryService.endSession({
                session_id: sessionId,
                summary: sanitize(summary),
            });
            
            activeSessions.delete(userId);
            logger.info(`[AgentMemory:Hook] 🔴 SessionEnd: Session ${sessionId} → Memories consolidated`);
            return result;
        } catch (err) {
            logger.warn(`[AgentMemory:Hook] SessionEnd failed: ${err.message}`);
            return null;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // OBSERVATION HOOKS (Auto-Capture Pipeline)
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * PostToolUse — Capture the output of any agent/tool execution.
     * This is the primary write path for building agent memory.
     * 
     * @param {string} agentName - The agent that executed
     * @param {string} task - What the agent was asked to do
     * @param {string} result - The agent's output
     * @param {object} metadata - Additional context (files touched, etc.)
     */
    static async captureToolUse(agentName, task, result, metadata = {}) {
        if (!agentMemoryService.isReady) return;
        
        const content = `Agent [${agentName}] executed task: "${task}"\nResult: ${typeof result === 'string' ? result.substring(0, 2000) : JSON.stringify(result).substring(0, 2000)}`;
        const sanitized = sanitize(content);
        
        if (isDuplicate(sanitized)) {
            logger.debug(`[AgentMemory:Hook] Dedup: Skipping duplicate observation for ${agentName}`);
            return;
        }
        
        try {
            await agentMemoryService.observe({
                hookType: 'PostToolUse',
                content: sanitized,
                type: 'tool_use',
                project: 'alti-code-studio',
                sessionId: activeSessions.get('system') || `session_${Date.now()}`,
                cwd: process.cwd(),
                timestamp: new Date().toISOString(),
                metadata: {
                    agent: agentName,
                    task: sanitize(task?.substring(0, 500)),
                    ...metadata,
                }
            });
        } catch (err) {
            logger.debug(`[AgentMemory:Hook] PostToolUse capture failed: ${err.message}`);
        }
    }
    
    /**
     * PostToolUseFailure — Capture agent failures for pattern detection.
     */
    static async captureToolFailure(agentName, task, error, metadata = {}) {
        if (!agentMemoryService.isReady) return;
        
        const content = `Agent [${agentName}] FAILED task: "${task}"\nError: ${error?.message || error}`;
        
        try {
            await agentMemoryService.observe({
                hookType: 'PostToolUseFailure',
                content: sanitize(content),
                type: 'error',
                project: 'alti-code-studio',
                sessionId: activeSessions.get('system') || `session_${Date.now()}`,
                cwd: process.cwd(),
                timestamp: new Date().toISOString(),
                metadata: {
                    agent: agentName,
                    task: sanitize(task?.substring(0, 500)),
                    error: error?.message || String(error),
                    ...metadata,
                }
            });
        } catch (err) {
            logger.debug(`[AgentMemory:Hook] PostToolUseFailure capture failed: ${err.message}`);
        }
    }
    
    /**
     * UserPromptSubmit — Capture the user's prompt for session context.
     */
    static async captureUserPrompt(userId, prompt, metadata = {}) {
        if (!agentMemoryService.isReady) return;
        
        const content = `User prompt: "${sanitize(prompt?.substring(0, 1000))}"`;
        
        if (isDuplicate(content)) return;
        
        try {
            await agentMemoryService.observe({
                hookType: 'UserPromptSubmit',
                content,
                type: 'user_prompt',
                project: 'alti-code-studio',
                sessionId: activeSessions.get(userId) || `session_${Date.now()}`,
                cwd: process.cwd(),
                timestamp: new Date().toISOString(),
                metadata: {
                    userId,
                    promptLength: prompt?.length,
                    ...metadata,
                }
            });
        } catch (err) {
            logger.debug(`[AgentMemory:Hook] UserPromptSubmit capture failed: ${err.message}`);
        }
    }
    
    /**
     * Capture a workflow/DAG execution as a structured memory.
     */
    static async captureWorkflowExecution(workflowId, nodes, edges, executionTimeMs, status) {
        if (!agentMemoryService.isReady) return;
        
        const agentChain = nodes.map(n => n.name || n.agentId).join(' → ');
        const content = `Workflow ${workflowId}: ${agentChain}\nNodes: ${nodes.length}, Edges: ${edges.length}\nExecution: ${executionTimeMs}ms, Status: ${status}`;
        
        try {
            await agentMemoryService.observe({
                hookType: 'SessionEnd',
                content: sanitize(content),
                type: 'workflow_execution',
                project: 'alti-code-studio',
                sessionId: `session_${workflowId}`,
                cwd: process.cwd(),
                timestamp: new Date().toISOString(),
                metadata: {
                    workflowId,
                    agentChain,
                    nodeCount: nodes.length,
                    edgeCount: edges.length,
                    executionTimeMs,
                    status,
                }
            });
        } catch (err) {
            logger.debug(`[AgentMemory:Hook] Workflow capture failed: ${err.message}`);
        }
    }
    
    /**
     * Capture an architectural decision / code pattern.
     */
    static async captureDecision(decision, reasoning, metadata = {}) {
        if (!agentMemoryService.isReady) return;
        
        try {
            await agentMemoryService.remember({
                hookType: 'Decision',
                content: sanitize(`Decision: ${decision}\nReasoning: ${reasoning}`),
                type: 'decision',
                project: 'alti-code-studio',
                sessionId: activeSessions.get('system') || `session_${Date.now()}`,
                cwd: process.cwd(),
                timestamp: new Date().toISOString(),
                tags: ['architecture', 'decision'],
                metadata: {
                    ...metadata,
                }
            });
        } catch (err) {
            logger.debug(`[AgentMemory:Hook] Decision capture failed: ${err.message}`);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // CONTEXT RECALL (Retrieval Path)
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Recall relevant context before an agent executes.
     * Uses triple-stream retrieval: BM25 + Vector + Knowledge Graph.
     * P50 under 20ms on laptop hardware.
     * 
     * @param {string} query - The agent's task/prompt
     * @param {number} limit - Max results
     * @returns {Array<string>} - Relevant memory fragments for context injection
     */
    /**
     * Recall relevant context before an agent executes.
     * Uses triple-stream retrieval: BM25 + Vector + Knowledge Graph + Local MEMORY.md.
     * P50 under 20ms on laptop hardware.
     * 
     * @param {string} query - The agent's task/prompt
     * @param {number} limit - Max results
     * @returns {Array<string>} - Relevant memory fragments for context injection
     */
    static async recallContext(query, limit = 5) {
        let memories = [];
        if (agentMemoryService.isReady) {
            try {
                const result = await agentMemoryService.smartSearch({
                    query: sanitize(query?.substring(0, 500)),
                    project: 'alti-code-studio',
                    limit,
                });
                if (result?.results && Array.isArray(result.results)) {
                    memories = result.results.map(r => 
                        `[Memory] ${r.content || r.text || JSON.stringify(r)}`
                    );
                }
            } catch (err) {
                logger.debug(`[AgentMemory:Hook] Context recall failed: ${err.message}`);
            }
        }

        // Merge matched rules from docs/MEMORY.md as high-fidelity active memory
        try {
            const localRules = await AgentMemoryHooks._getMatchedLocalMemoryRules(query);
            const formattedRules = localRules.map(r => `[MimoMemory] ${r}`);
            const merged = [...formattedRules, ...memories];
            return merged.slice(0, limit);
        } catch (err) {
            logger.debug(`[AgentMemory:Hook] Failed to merge local memory rules: ${err.message}`);
            return memories.slice(0, limit);
        }
    }
    
    /**
     * Get full project context for session injection.
     * Returns top concepts, files, patterns from accumulated memories.
     */
    static async getProjectContext(tokenBudget = 2000) {
        let context = '';
        if (agentMemoryService.isReady) {
            try {
                const result = await agentMemoryService.getContext({
                    project: 'alti-code-studio',
                    token_budget: tokenBudget,
                });
                context = result?.context || result?.content || '';
            } catch (err) {
                logger.debug(`[AgentMemory:Hook] Project context failed: ${err.message}`);
            }
        }

        // Prepend local MEMORY.md content as consolidated long-term rules
        try {
            const memoryMdPath = path.join(process.cwd(), 'docs', 'MEMORY.md');
            const localMemoryContent = await fs.readFile(memoryMdPath, 'utf8');
            if (localMemoryContent) {
                context = `=== COMPACTED LONG-TERM MEMORY RULES ===\n${localMemoryContent}\n\n${context}`;
            }
        } catch {
            // docs/MEMORY.md doesn't exist or failed to read; ignore
        }

        return context;
    }

    static async _readLocalMemoryMdRules() {
        try {
            const memoryMdPath = path.join(process.cwd(), 'docs', 'MEMORY.md');
            const content = await fs.readFile(memoryMdPath, 'utf8');
            const lines = content.split('\n');
            const rules = [];
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                    // Extract rule text after the bullet point
                    const ruleText = trimmed.replace(/^[-*]\s+/, '');
                    if (ruleText) {
                        rules.push(ruleText);
                    }
                }
            }
            return rules;
        } catch {
            return [];
        }
    }

    static async _getMatchedLocalMemoryRules(query) {
        if (!query || typeof query !== 'string') return [];
        const rules = await AgentMemoryHooks._readLocalMemoryMdRules();
        if (rules.length === 0) return [];

        const words = query
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length >= 3);

        if (words.length === 0) return [];

        const scoredRules = rules.map(rule => {
            const lowerRule = rule.toLowerCase();
            let matches = 0;
            for (const word of words) {
                if (lowerRule.includes(word)) {
                    matches++;
                }
            }
            return { rule, matches };
        });

        return scoredRules
            .filter(sr => sr.matches > 0)
            .sort((a, b) => b.matches - a.matches)
            .map(sr => sr.rule);
    }
    
    /**
     * Query the knowledge graph for entity relationships.
     */
    static async queryKnowledgeGraph(entity, depth = 2) {
        if (!agentMemoryService.isReady) return null;
        
        try {
            return await agentMemoryService.graphQuery({
                entity,
                depth,
                project: 'alti-code-studio',
            });
        } catch (err) {
            logger.debug(`[AgentMemory:Hook] Graph query failed: ${err.message}`);
            return null;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // EXPRESS MIDDLEWARE
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Express middleware that auto-captures agent API interactions.
     * Mount on routes that handle agent/AI requests.
     * 
     * Usage: router.use('/ai', AgentMemoryHooks.middleware());
     */
    static middleware() {
        return async (req, res, next) => {
            const startTime = Date.now();
            const userId = req.user?.id || req.user?.userId || 'anonymous';
            
            // Capture the user's prompt if present
            if (req.body?.prompt && req.method === 'POST') {
                // Fire and forget — don't block the request
                AgentMemoryHooks.captureUserPrompt(userId, req.body.prompt, {
                    path: req.path,
                    method: req.method,
                }).catch(() => {});
            }
            
            // Intercept the response to capture the result
            const originalJson = res.json.bind(res);
            res.json = function(data) {
                const executionTime = Date.now() - startTime;
                
                // Capture successful agent responses
                if (data?.success && data?.data && req.body?.prompt) {
                    const resultSummary = typeof data.data === 'string' 
                        ? data.data.substring(0, 1000)
                        : JSON.stringify(data.data).substring(0, 1000);
                    
                    AgentMemoryHooks.captureToolUse(
                        'api_endpoint',
                        req.body.prompt,
                        resultSummary,
                        {
                            path: req.path,
                            method: req.method,
                            statusCode: res.statusCode,
                            executionTimeMs: executionTime,
                        }
                    ).catch(() => {});
                }
                
                return originalJson(data);
            };
            
            next();
        };
    }
}

export { AgentMemoryHooks };
export default AgentMemoryHooks;
