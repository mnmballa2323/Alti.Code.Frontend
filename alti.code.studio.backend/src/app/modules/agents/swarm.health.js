/**
 * Copyright (c) 2024 Inso Code
 * 
 * swarm.health.js — The Swarm Health Monitor
 * 
 * Provides real-time health status for all specialist agents.
 * Runs a lightweight ping against each agent's consult() to verify
 * the pipeline is functional. Exposes a /api/swarm/health endpoint.
 */

import { logger } from '../../../shared/logger.js';
import { capabilityRouter } from '../agents/capability.router.js';
import { autonomicService } from '../surgeon/autonomic.service.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class SwarmHealthMonitor {
    constructor() {
        this.statuses = new Map();  // agentName -> { status, lastChecked, latencyMs, error? }
        this.isRunning = false;
        this.intervalId = null;
    }

    /**
     * Run a single ping against one agent.
     */
    async pingAgent(agentEntry) {
        const { agent } = agentEntry;
        const name = agent.name;
        const start = Date.now();

        // Structural validation — no LLM call needed
        const isStaticDefinition = typeof agent.consult !== 'function' && !agent.preamble;
        const hasRequiredFields = (
            typeof agent.name === 'string' &&
            typeof agent.description === 'string' &&
            (isStaticDefinition || (typeof agent.preamble === 'string' && typeof agent.consult === 'function'))
        );

        const latencyMs = Date.now() - start;

        if (hasRequiredFields) {
            this.statuses.set(name, {
                status: 'healthy',
                lastChecked: new Date().toISOString(),
                latencyMs,
            });
        } else {
            this.statuses.set(name, {
                status: 'degraded',
                lastChecked: new Date().toISOString(),
                latencyMs,
                error: 'Missing required fields: name, description, preamble, or consult()',
            });
        }
    }

    /**
     * Sweep all registered agents in the capability table.
     * After the sweep, any agents in 'degraded' state trigger the drift
     * detection pipeline — autonomicService scans the agent source file
     * for cyclomatic complexity and patches it if needed.
     */
    async sweep() {
        const agents = capabilityRouter.table;
        logger.info(`🏥 SwarmHealth: Sweeping ${agents.length} agents...`);

        await Promise.allSettled(agents.map(entry => this.pingAgent(entry)));

        const healthy = [...this.statuses.values()].filter(s => s.status === 'healthy').length;
        const degraded = [...this.statuses.values()].filter(s => s.status === 'degraded').length;

        logger.info(`🏥 SwarmHealth: ${healthy} healthy / ${degraded} degraded / ${agents.length} total`);

        // ── DRIFT DETECTION ──────────────────────────────────────────────────
        if (degraded > 0) {
            const degradedEntries = [...this.statuses.entries()]
                .filter(([, s]) => s.status === 'degraded');

            logger.warn(
                `🚨 SwarmHealth DRIFT_ALERT: ${degraded} degraded agent(s) detected.`,
                degradedEntries.map(([name, s]) => ({ name, error: s.error }))
            );

            // Collect source file paths for degraded agents so the surgeon
            // can scan them for complexity and apply patches.
            const agentsDir = path.resolve(__dirname, '../agents');
            const targetFiles = degradedEntries
                .map(([name]) => {
                    // Convention: agent source file is <name>.agent.js
                    const slug = name.toLowerCase().replace(/\s+/g, '.');
                    return path.join(agentsDir, `${slug}.js`);
                })
                .filter(f => {
                    try { require('fs').accessSync(f); return true; } catch { return false; }
                });

            if (targetFiles.length > 0) {
                logger.info(`🚨 SwarmHealth: Triggering autonomic sweep on ${targetFiles.length} degraded agent(s)...`);
                autonomicService.commenceProactiveSweep(targetFiles)
                    .then(result => logger.info(`🚨 SwarmHealth: Autonomic sweep complete — eliminated ${result.eliminated} debt item(s).`))
                    .catch(err => logger.error('🚨 SwarmHealth: Autonomic sweep failed:', err));
            } else {
                logger.info('🚨 SwarmHealth: No resolvable source files for degraded agents. Manual review needed.');
            }
        }
    }

    /**
     * Start background health monitoring on a configurable interval.
     * @param {number} intervalMs - default 5 minutes
     */
    start(intervalMs = 5 * 60 * 1000) {
        if (this.isRunning) return;
        this.isRunning = true;

        // Initial sweep immediately
        this.sweep().catch(e => logger.error('SwarmHealth initial sweep failed:', e));

        // Periodic sweeps
        this.intervalId = setInterval(() => {
            this.sweep().catch(e => logger.error('SwarmHealth sweep failed:', e));
        }, intervalMs);

        logger.info(`🏥 SwarmHealth: Monitor started (interval: ${intervalMs / 1000}s)`);
    }

    /**
     * Stop the background monitor.
     */
    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.isRunning = false;
        logger.info(`🏥 SwarmHealth: Monitor stopped.`);
    }

    /**
     * Get the full health report as a structured object.
     * @returns {{ summary: object, agents: object[] }}
     */
    getReport() {
        const agents = [...this.statuses.entries()].map(([name, status]) => ({ name, ...status }));
        const healthy = agents.filter(a => a.status === 'healthy').length;
        const degraded = agents.filter(a => a.status === 'degraded').length;

        return {
            summary: {
                total: agents.length,
                healthy,
                degraded,
                uptime: `${((healthy / (agents.length || 1)) * 100).toFixed(1)}%`,
                lastSweep: agents[0]?.lastChecked ?? null,
            },
            agents,
        };
    }

    /**
     * Get health status for a single agent by name.
     * @param {string} name
     */
    getAgentStatus(name) {
        return this.statuses.get(name) ?? { status: 'unknown', error: 'Agent not yet pinged' };
    }
}

export const swarmHealthMonitor = new SwarmHealthMonitor();
