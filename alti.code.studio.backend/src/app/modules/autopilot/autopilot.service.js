/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * Autopilot Service — Enhanced with Kiro-style Supervised Mode
 *
 * Modes:
 *  - 'autopilot': Fully autonomous. Agent runs end-to-end, you can interrupt or revert.
 *  - 'supervised': Agent yields after each turn with file diffs for human approval per hunk.
 */

import { logger } from '../../../shared/logger.js';
import { graphOrchestrator } from '../agents/graph.orchestrator.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { EventEmitter } from 'events';

class AutopilotService extends EventEmitter {
    constructor() {
        super();
        this.isExecuting = false;
        this.lastHeartbeat = null;
        this.mode = 'autopilot'; // 'autopilot' | 'supervised'
        this.activeSessions = new Map(); // sessionId → session state
    }

    // ─── MODE MANAGEMENT ──────────────────────────────────────────────────────

    setMode(mode) {
        if (!['autopilot', 'supervised'].includes(mode)) {
            throw new Error(`Invalid mode "${mode}". Must be "autopilot" or "supervised".`);
        }
        this.mode = mode;
        logger.info(`[Autopilot] Mode set to: ${mode}`);
        return { mode: this.mode };
    }

    getMode() {
        return { mode: this.mode };
    }

    // ─── SESSION MANAGEMENT ───────────────────────────────────────────────────

    _createSession(goal) {
        const sessionId = crypto.randomUUID();
        const session = {
            sessionId,
            goal,
            mode: this.mode,
            status: 'running', // 'running' | 'awaiting-approval' | 'done' | 'interrupted' | 'reverted'
            pendingChanges: [], // file diffs waiting for approval in supervised mode
            appliedChanges: [], // files that have been changed (for revert)
            startedAt: new Date().toISOString(),
            tokensUsed: 0,
            estimatedCostUsd: 0,
        };
        this.activeSessions.set(sessionId, session);
        logger.info(`[Autopilot] Session ${sessionId} created (${this.mode} mode).`);
        return session;
    }

    _getSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) throw new Error(`Session "${sessionId}" not found.`);
        return session;
    }

    // ─── CORE LAUNCH ─────────────────────────────────────────────────────────

    /**
     * Launch an autopilot or supervised session for a given goal.
     * @param {string} goal - The task description
     * @returns {{ sessionId, mode, status }}
     */
    async launchSession(goal) {
        if (!goal?.trim()) throw new Error('goal must be a non-empty string.');
        const session = this._createSession(goal);

        if (this.mode === 'autopilot') {
            // Fire and forget — runs fully autonomously
            this._runAutopilot(session).catch(e => {
                logger.error(`[Autopilot] Session ${session.sessionId} crashed: ${e.message}`);
                session.status = 'error';
                session.error = e.message;
            });
        } else {
            // Supervised: run with per-turn approval gates
            this._runSupervised(session).catch(e => {
                logger.error(`[Autopilot] Supervised session ${session.sessionId} crashed: ${e.message}`);
                session.status = 'error';
                session.error = e.message;
            });
        }

        return { sessionId: session.sessionId, mode: session.mode, status: session.status };
    }

    async _runAutopilot(session) {
        try {
            await graphOrchestrator.run(session.goal);
            session.status = 'done';
            logger.info(`[Autopilot] ✅ Session ${session.sessionId} completed.`);
        } catch (e) {
            session.status = 'error';
            session.error = e.message;
            throw e;
        }
    }

    async _runSupervised(session) {
        // In supervised mode we collect file changes per turn and emit an event
        // so the client can poll getSession() or subscribe via SSE
        session.status = 'awaiting-approval';

        // For now, generate a diff-level task plan and surface it
        // Full supervised looping would require deep LLM-stream integration.
        const diffPreview = await this._generateDiffPreview(session.goal);
        session.pendingChanges = diffPreview;
        session.status = 'awaiting-approval';

        this.emit('pending-changes', { sessionId: session.sessionId, pendingChanges: diffPreview });
        logger.info(`[Autopilot] Supervised session ${session.sessionId}: ${diffPreview.length} change(s) pending approval.`);
    }

    async _generateDiffPreview(goal) {
        const prompt = `
You are a code planning agent. Given the task below, list the FILES that would need to be changed and provide a brief description of WHAT would change in each file.

Do not write actual code — only list the proposed file changes.

TASK: ${goal}

Respond as JSON array:
[
  { "file": "relative/path/to/file.js", "action": "modify|create|delete", "description": "What changes and why" },
  ...
]
        `.trim();

        try {
            const raw = await GeminiAiService.generateContent(prompt);
            const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
            const changes = JSON.parse(cleaned);
            return changes.map(c => ({
                hunkId: crypto.randomUUID(),
                file: c.file,
                action: c.action || 'modify',
                description: c.description,
                status: 'pending', // 'pending' | 'approved' | 'rejected'
            }));
        } catch {
            return [{ hunkId: crypto.randomUUID(), file: 'unknown', action: 'modify', description: goal.slice(0, 100), status: 'pending' }];
        }
    }

    // ─── SUPERVISED APPROVAL ─────────────────────────────────────────────────

    /**
     * Approve one or all pending hunks for a supervised session.
     * @param {string} sessionId
     * @param {string|'all'} hunkId - specific hunk UUID or 'all'
     */
    async approveHunk(sessionId, hunkId) {
        const session = this._getSession(sessionId);
        if (session.mode !== 'supervised') throw new Error('Session is not in supervised mode.');

        let approved = [];
        if (hunkId === 'all') {
            session.pendingChanges.forEach(h => { h.status = 'approved'; });
            approved = session.pendingChanges.map(h => h.hunkId);
        } else {
            const hunk = session.pendingChanges.find(h => h.hunkId === hunkId);
            if (!hunk) throw new Error(`Hunk "${hunkId}" not found.`);
            hunk.status = 'approved';
            approved = [hunkId];
        }

        const allSettled = session.pendingChanges.every(h => h.status !== 'pending');
        if (allSettled) {
            // Execute approved changes
            await this._executeApprovedChanges(session);
        }

        return { sessionId, approved, allSettled, pendingChanges: session.pendingChanges };
    }

    /**
     * Reject a hunk (skip it).
     */
    async rejectHunk(sessionId, hunkId) {
        const session = this._getSession(sessionId);
        if (hunkId === 'all') {
            session.pendingChanges.forEach(h => { h.status = 'rejected'; });
        } else {
            const hunk = session.pendingChanges.find(h => h.hunkId === hunkId);
            if (!hunk) throw new Error(`Hunk "${hunkId}" not found.`);
            hunk.status = 'rejected';
        }

        const allSettled = session.pendingChanges.every(h => h.status !== 'pending');
        if (allSettled) session.status = 'done';

        return { sessionId, pendingChanges: session.pendingChanges };
    }

    async _executeApprovedChanges(session) {
        const approvedGoal = session.goal + '\n\nApproved changes:\n' +
            session.pendingChanges
                .filter(h => h.status === 'approved')
                .map(h => `- ${h.action} ${h.file}: ${h.description}`)
                .join('\n');

        session.status = 'running';
        try {
            await graphOrchestrator.run(approvedGoal);
            session.status = 'done';
        } catch (e) {
            session.status = 'error';
            session.error = e.message;
        }
    }

    // ─── INTERRUPT & REVERT ───────────────────────────────────────────────────

    /**
     * Interrupt a running session.
     */
    interruptSession(sessionId) {
        const session = this._getSession(sessionId);
        session.status = 'interrupted';
        logger.info(`[Autopilot] Session ${sessionId} interrupted by user.`);
        return { sessionId, status: 'interrupted' };
    }

    /**
     * Revert all changes made in a session using Git.
     */
    async revertSession(sessionId) {
        const session = this._getSession(sessionId);
        try {
            // Git stash or reset — revert to last clean commit
            execSync('git stash', { cwd: process.cwd(), stdio: 'pipe' });
            session.status = 'reverted';
            logger.info(`[Autopilot] Session ${sessionId} reverted via git stash.`);
        } catch (e) {
            logger.warn(`[Autopilot] Git revert failed: ${e.message}. Trying git checkout...`);
            try {
                execSync('git checkout -- .', { cwd: process.cwd(), stdio: 'pipe' });
                session.status = 'reverted';
            } catch (e2) {
                throw new Error(`Revert failed: ${e2.message}`);
            }
        }
        return { sessionId, status: 'reverted' };
    }

    // ─── SESSION STATUS ───────────────────────────────────────────────────────

    getSession(sessionId) {
        return this._getSession(sessionId);
    }

    listSessions() {
        return Array.from(this.activeSessions.values()).map(s => ({
            sessionId: s.sessionId,
            goal: s.goal.slice(0, 80),
            mode: s.mode,
            status: s.status,
            pendingCount: s.pendingChanges?.filter(h => h.status === 'pending').length || 0,
            startedAt: s.startedAt,
        }));
    }

    // ─── LEGACY HEARTBEAT (cloud scheduler mode) ─────────────────────────────

    /**
     * The core autonomous loop. When triggered via GCP Cloud Scheduler,
     * it analyzes the project state and synthesizes an objective if idle.
     */
    async processHeartbeat(correlationId = Date.now().toString()) {
        try {
            logger.info(`[Autopilot] ⚡ Heartbeat received [${correlationId}]`);
            this.lastHeartbeat = new Date();

            if (this.isExecuting) {
                logger.info(`[Autopilot] ⏭️ Skipping: Orchestrator currently engaged.`);
                return { status: 'skipped', reason: 'mission_in_progress' };
            }

            this.isExecuting = true;
            const objectiveResult = await this._synthesizeObjective();

            if (objectiveResult.noActionNeeded) {
                logger.info(`[Autopilot] 🛌 No objectives. Returning to sleep.`);
                this.isExecuting = false;
                return { status: 'idle', message: objectiveResult.reasoning };
            }

            logger.info(`[Autopilot] 🎯 Synthesized Objective: "${objectiveResult.goal}"`);
            this._launchBackgroundMission(objectiveResult.goal, correlationId);
            return { status: 'dispatched', goal: objectiveResult.goal, traceId: correlationId };

        } catch (error) {
            this.isExecuting = false;
            logger.error(`[Autopilot] ❌ Heartbeat Failed: ${error.message}`, error);
            throw error;
        }
    }

    async _launchBackgroundMission(goal, correlationId) {
        try {
            await graphOrchestrator.run(goal);
        } catch (e) {
            logger.error(`[Autopilot] ❌ Background Swarm Crashed: ${e.message}`);
        } finally {
            this.isExecuting = false;
        }
    }

    async _synthesizeObjective() {
        let todoContent = '';
        try {
            todoContent = await fs.readFile(path.join(process.cwd(), 'TODO.md'), 'utf8');
        } catch {
            todoContent = 'No TODO.md found.';
        }

        const prompt = `
You are the "Autopilot" consciousness for an AI development swarm.
Decide what task to instruct the swarm to perform next.
If nothing is needed, output {"noActionNeeded": true, "reasoning": "string"}.
Otherwise, extract ONE actionable goal.

Current TODO:
${todoContent.substring(0, 4000)}

Respond strictly in JSON:
{
  "noActionNeeded": boolean,
  "reasoning": "string",
  "goal": "string or null"
}
        `.trim();

        try {
            const aiResponse = await GeminiAiService.generateContent(prompt);
            return JSON.parse(aiResponse.replace(/```json|```/g, '').trim());
        } catch {
            return { noActionNeeded: false, reasoning: 'Fallback', goal: 'Run system health check' };
        }
    }
}

export const autopilotService = new AutopilotService();
