/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * OPENCLAW CORE INTEGRATION
 * Bridges Alti.Code.Studio's AgentRegistry and OpenClaw's Clawdinators.
 * Uses the real acpx CLI for ACP-based agent dispatch.
 * MIT License — https://github.com/openclaw/openclaw
 */

import { logger } from '../../../shared/logger.js';
import { agentRegistry } from '../agents/agent.registry.js';
import { CircuitBreaker } from '../enterprise/resilience.js';
import { complianceEngine } from '../enterprise/compliance.engine.js';
import { acpxService } from './acpx.service.js';
import { openClawSkills } from './skills.bridge.js';
import { lobsterService } from './lobster.service.js';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

const executeSchema = z.object({
    taskPattern: z.string().min(3),
    payload: z.record(z.any()).optional().default({}),
    tenantId: z.string().optional(),
    agent: z.string().optional().default('gemini'),
    sessionName: z.string().optional(),
    oneShot: z.boolean().optional().default(false),
});

class OpenClawCoreIntegration {
    constructor() {
        this.basePath = path.resolve('submodules', 'openclaw', 'openclaw');
        this.clawdinatorPath = path.resolve('submodules', 'openclaw', 'clawdinators');
        this.isInitialized = false;

        // Resilience: Wrap the OpenClaw coordinator in a CircuitBreaker
        this.breaker = new CircuitBreaker('openclaw-coordinator', {
            failureThreshold: 3,
            resetTimeout: 10000
        });
    }

    async init() {
        if (!fs.existsSync(this.basePath)) {
            logger.warn('[openclaw-core] OpenClaw submodule not found. Deferring initialization.');
            return;
        }

        logger.info('[openclaw-core] Initializing OpenClaw Core Integration...');

        // Load skills from all sources
        await openClawSkills.loadSkills();

        // Register OpenClaw as a synthetic agent in the registry
        agentRegistry.register({
            name: 'openclawCore',
            description: 'OpenClaw Autonomous Coordination Engine — ACP, Lobster, Skills, ClawhHub',
            prompt: 'You are the OpenClaw orchestration engine. You dispatch requests via ACP to clawdinators and manage lobster workflows.',
            capabilities: ['openclaw', 'routing', 'delegation', 'acp', 'lobster', 'skills', 'clawhub'],
        });

        this.isInitialized = true;
        logger.info(`[openclaw-core] Initialized. Skills loaded: ${openClawSkills.skillCount}`);
    }

    /**
     * Execute a Clawdinator task via real acpx ACP dispatch.
     * @param {string} taskPattern - The task description to dispatch
     * @param {object} payload - Optional context payload
     * @param {string} tenantId - Tenant identifier for compliance
     * @param {object} opts - { agent, sessionName, oneShot }
     */
    async executeClawdinator(taskPattern, payload = {}, tenantId = 'system', opts = {}) {
        if (!this.isInitialized) throw new Error('[openclaw-core] OpenClaw Core not initialized');

        const validated = executeSchema.parse({
            taskPattern,
            payload,
            tenantId,
            agent: opts.agent || 'gemini',
            sessionName: opts.sessionName,
            oneShot: opts.oneShot ?? false,
        });

        logger.info(`[openclaw-core] Dispatching to Clawdinator via ACP: "${validated.taskPattern}" agent="${validated.agent}"`);

        // Compliance audit
        await complianceEngine.log({
            tenantId: validated.tenantId,
            actor: 'system',
            action: 'OPENCLAW_ACP_DISPATCH',
            resource: `clawdinator:${validated.taskPattern}`,
            status: 'SUCCESS',
            metadata: { severity: 'LOW', agent: validated.agent }
        });

        // Circuit Breaker check
        if (!(await this.breaker.isAvailable())) {
            throw new Error(`[openclaw-core] Circuit Breaker OPEN for ${this.breaker.name}`);
        }

        try {
            // Build the full context prompt
            const contextHint = Object.keys(validated.payload).length > 0
                ? `\nContext: ${JSON.stringify(validated.payload)}`
                : '';
            const fullPrompt = `${validated.taskPattern}${contextHint}`;

            let result;

            if (validated.oneShot) {
                // One-shot exec — no persistent session
                const output = await acpxService.exec(validated.agent, fullPrompt, { timeout: 60000 });
                result = {
                    status: 'success',
                    taskPattern: validated.taskPattern,
                    agent: validated.agent,
                    mode: 'one-shot',
                    openclawResponse: output,
                };
            } else {
                // Session-scoped dispatch
                await acpxService.ensureSession(validated.agent, validated.sessionName || null);
                const output = await acpxService.prompt(
                    validated.agent,
                    fullPrompt,
                    validated.sessionName || null,
                    { timeout: 60000 }
                );
                result = {
                    status: 'success',
                    taskPattern: validated.taskPattern,
                    agent: validated.agent,
                    sessionName: validated.sessionName,
                    mode: 'session',
                    openclawResponse: output,
                };
            }

            await this.breaker.recordSuccess();
            return result;
        } catch (err) {
            await this.breaker.recordFailure(err);
            logger.error(`[openclaw-core] ACP dispatch failed: ${err.message}`);
            throw err;
        }
    }

    /**
     * Execute a Lobster pipeline workflow.
     * @param {string} expression - Lobster DSL expression or workflow file path
     */
    async executeWorkflow(expression, inputData = null) {
        if (expression.endsWith('.lobster') && fs.existsSync(expression)) {
            return lobsterService.runWorkflow(expression, inputData);
        }
        return lobsterService.exec(expression);
    }

    /** Get all loaded skills summary */
    getSkillsSummary() {
        return {
            total: openClawSkills.skillCount,
            bySource: {
                'openclaw/skills': openClawSkills.getSkillsBySource('openclaw/skills').length,
                'agent-skills-context': openClawSkills.getSkillsBySource('agent-skills-context').length,
                'clawhub': openClawSkills.getSkillsBySource('clawhub').length,
            }
        };
    }
}

export const openClawCore = new OpenClawCoreIntegration();

