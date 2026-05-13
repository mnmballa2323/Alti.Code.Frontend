/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * ORCHESTRATOR → ENTERPRISE BRIDGE
 * 
 * Intercepts every agent dispatch and connects it to all enterprise modules:
 *   1. Event Bus     — publishes agent.dispatched / agent.completed / agent.failed
 *   2. Result Store  — persists every result for cost attribution
 *   3. Compliance    — auto-classifies output, logs audit trail
 *   4. Resilience    — wraps AI calls with circuit breakers + failover
 * 
 * This is the glue that makes the 115-agent system enterprise-grade.
 */

import { eventBus, EVENT_TYPES } from './event.bus.js';
import { resultStore } from './result.store.js';
import { complianceEngine } from './compliance.engine.js';
import { resilientAI } from './resilience.js';
import { logger } from '../../../shared/logger.js';

class EnterpriseBridge {
    constructor() {
        this.enabled = true;
        this.stats = {
            totalDispatches: 0,
            complianceScans: 0,
            piiDetections: 0,
            failovers: 0,
            totalTokens: 0,
            bridgeBootedAt: new Date().toISOString(),
        };
    }

    // ═══════════════════════════════════════════════
    // Pre-dispatch Hook (called BEFORE agent runs)
    // ═══════════════════════════════════════════════

    async onBeforeDispatch(job) {
        if (!this.enabled) return job;

        const { agentName, task, tenantId = 'default', mode = 'AUTONOMOUS' } = job;
        this.stats.totalDispatches++;

        // 1. Classify inbound data for PII
        const inputText = typeof task === 'string' ? task : JSON.stringify(task);
        const classification = complianceEngine.classifyData(inputText);

        if (classification.findings.length > 0) {
            this.stats.piiDetections++;

            // Log the detection
            await complianceEngine.log({
                action: 'PII_DETECTED_IN_INPUT',
                actor: 'system',
                tenantId,
                resource: `agent:${agentName}`,
                details: {
                    classification: classification.classification,
                    findingTypes: classification.findings.map(f => f.type),
                    requiresEncryption: classification.requiresEncryption,
                },
            });

            logger.warn(`🔐 PII detected in dispatch to ${agentName}: ${classification.findings.length} findings`);
        }

        // 2. Publish event
        await eventBus.publish(EVENT_TYPES.AGENT_DISPATCHED, {
            agentName,
            tenantId,
            mode,
            classification: classification.classification,
            timestamp: new Date().toISOString(),
        }, { tenantId });

        // 3. Audit trail
        await complianceEngine.log({
            action: 'AGENT_DISPATCH',
            actor: tenantId,
            tenantId,
            resource: `agent:${agentName}`,
            details: { mode, task: inputText.substring(0, 200) },
        });

        return {
            ...job,
            _bridge: {
                startTime: Date.now(),
                classification: classification.classification,
                tenantId,
            },
        };
    }

    // ═══════════════════════════════════════════════
    // Post-dispatch Hook (called AFTER agent completes)
    // ═══════════════════════════════════════════════

    async onAfterDispatch(job, result) {
        if (!this.enabled) return result;

        const bridge = job._bridge || {};
        const durationMs = bridge.startTime ? Date.now() - bridge.startTime : 0;
        const tenantId = bridge.tenantId || job.tenantId || 'default';
        const agentName = job.agentName || 'unknown';

        // 1. Classify output for PII
        const outputText = typeof result === 'string' ? result : JSON.stringify(result || {});
        const outputClassification = complianceEngine.classifyData(outputText);

        if (outputClassification.findings.length > 0) {
            this.stats.piiDetections++;
            await complianceEngine.log({
                action: 'PII_DETECTED_IN_OUTPUT',
                actor: 'system',
                tenantId,
                resource: `agent:${agentName}`,
                details: {
                    classification: outputClassification.classification,
                    findingTypes: outputClassification.findings.map(f => f.type),
                },
            });
        }

        // 2. Persist result for billing/cost attribution
        const tokensUsed = result?.tokensUsed || result?.usage?.total_tokens || 0;
        this.stats.totalTokens += tokensUsed;

        await resultStore.save({
            tenantId,
            agentName,
            squad: job.squad || 'general',
            jobId: job.jobId || `job_${Date.now()}`,
            input: job.task,
            output: result,
            tokensUsed,
            durationMs,
            model: result?.model || result?.provider || 'unknown',
        });

        // 3. Publish completion event
        await eventBus.publish(EVENT_TYPES.AGENT_COMPLETED, {
            agentName,
            tenantId,
            durationMs,
            tokensUsed,
            outputClassification: outputClassification.classification,
        }, { tenantId });

        // 4. Audit trail
        await complianceEngine.log({
            action: 'AGENT_COMPLETE',
            actor: tenantId,
            tenantId,
            resource: `agent:${agentName}`,
            details: { durationMs, tokensUsed },
        });

        return result;
    }

    // ═══════════════════════════════════════════════
    // Failure Hook (called when agent fails)
    // ═══════════════════════════════════════════════

    async onDispatchError(job, error) {
        const tenantId = job._bridge?.tenantId || job.tenantId || 'default';
        const agentName = job.agentName || 'unknown';

        // 1. Publish failure event
        await eventBus.publish(EVENT_TYPES.AGENT_FAILED, {
            agentName,
            tenantId,
            error: error.message,
            timestamp: new Date().toISOString(),
        }, { tenantId });

        // 2. Audit trail
        await complianceEngine.log({
            action: 'AGENT_ERROR',
            actor: tenantId,
            tenantId,
            resource: `agent:${agentName}`,
            details: { error: error.message, stack: error.stack?.substring(0, 500) },
        });

        logger.error(`❌ Agent ${agentName} failed for tenant ${tenantId}: ${error.message}`);
    }

    // ═══════════════════════════════════════════════
    // Resilient AI Execution (wraps provider calls)
    // ═══════════════════════════════════════════════

    async executeWithResilience(fn, options = {}) {
        try {
            const result = await resilientAI.execute(fn, options);

            if (result.retries > 0) {
                this.stats.failovers++;
            }

            return result;
        } catch (error) {
            await eventBus.publish(EVENT_TYPES.SYSTEM_ERROR, {
                component: 'resilientAI',
                error: error.message,
                allProvidersFailed: true,
            });
            throw error;
        }
    }

    // ═══════════════════════════════════════════════
    // Status & Control
    // ═══════════════════════════════════════════════

    getStats() {
        return { ...this.stats };
    }

    enable() {
        this.enabled = true;
        logger.info('🌉 Enterprise Bridge ENABLED');
    }

    disable() {
        this.enabled = false;
        logger.info('🌉 Enterprise Bridge DISABLED');
    }
}

export const enterpriseBridge = new EnterpriseBridge();
