/**
 * Copyright (c) 2026 Alti Code Studio
 * 
 * EVENT BUS — Microsoft Azure Service Bus Integration Layer
 * 
 * All agent events flow through this bus:
 *   - Agent dispatched, completed, failed
 *   - Workflow started, step completed, workflow finished
 *   - Alert triggers (quota exceeded, security scan findings)
 * 
 * Subscribers can be:
 *   - Webhooks (Slack, Teams, PagerDuty, JIRA)
 *   - Internal services (analytics, cost tracking)
 *   - External APIs (customer event listeners)
 * 
 * Production: Azure Service Bus / Event Grid
 * Development: In-memory event emitter
 */

import { logger } from '../../../shared/logger.js';
import { azurePubSubService } from '../azureCloud/azurePubSub.service.js';
import { webhookManager as webhookDispatcher } from './webhook.manager.js';

const PROJECT_ID = process.env.ARM_SUBSCRIPTION_ID || 'azure-active';
const TOPIC_NAME = 'alti-code-studio-events';

// ── Event Types ──
const EVENT_TYPES = {
    // Agent lifecycle
    AGENT_DISPATCHED: 'agent.dispatched',
    AGENT_COMPLETED: 'agent.completed',
    AGENT_FAILED: 'agent.failed',
    AGENT_TIMEOUT: 'agent.timeout',

    // Workflow lifecycle
    WORKFLOW_STARTED: 'workflow.started',
    WORKFLOW_STEP_COMPLETED: 'workflow.step.completed',
    WORKFLOW_COMPLETED: 'workflow.completed',
    WORKFLOW_FAILED: 'workflow.failed',

    // Orchestrator events
    PLAN_CREATED: 'orchestrator.plan.created',
    PLAN_APPROVED: 'orchestrator.plan.approved',
    PLAN_REJECTED: 'orchestrator.plan.rejected',

    // Security & compliance
    SECURITY_FINDING: 'security.finding',
    COMPLIANCE_VIOLATION: 'compliance.violation',

    // Tenant events
    QUOTA_WARNING: 'tenant.quota.warning',
    QUOTA_EXCEEDED: 'tenant.quota.exceeded',
    TENANT_SUSPENDED: 'tenant.suspended',

    // System events
    PROVIDER_FAILOVER: 'system.provider.failover',
    CIRCUIT_OPENED: 'system.circuit.opened',
    HEALTH_DEGRADED: 'system.health.degraded',
};

class EventBus {
    constructor() {
        /** @type {Map<string, Function[]>} */
        this.subscribers = new Map();
        /** @type {object[]} Event history for replay */
        this.eventLog = [];
        this.maxLogSize = 10000;
        this.totalPublished = 0;
    }

    /**
     * Publish an event to Azure Service Bus (and local subscribers)
     * @param {string} eventType - One of EVENT_TYPES
     * @param {object} payload - Event data
     * @param {object} meta - { tenantId, userId, correlationId }
     */
    async publish(eventType, payload, meta = {}) {
        this.totalPublished++;
        const event = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            type: eventType,
            payload,
            tenantId: meta.tenantId || 'system',
            userId: meta.userId || 'system',
            correlationId: meta.correlationId || null,
            timestamp: new Date().toISOString(),
            region: process.env.AZURE_REGION || 'eastus',
        };

        // 1. Enterprise Streaming: Azure Service Bus / Event Grid
        if (PROJECT_ID) {
            try {
                const messageId = await azurePubSubService.publishEvent(TOPIC_NAME, event);
                logger.debug(`☁️ Azure Service Bus: published ${eventType} [msg: ${messageId}]`);
            } catch (err) {
                logger.warn(`⚠️ Azure Service Bus publish failed (${err.message}). Falling back to local Map...`);
            }
        }

        // 2. Local Fallback & Memory Logging
        this.eventLog.push(event);
        if (this.eventLog.length > this.maxLogSize) this.eventLog.shift();

        // Dispatch to local fast-path subscribers
        const subs = this.subscribers.get(eventType) || [];
        const wildcardSubs = this.subscribers.get('*') || [];

        const allSubs = [...subs, ...wildcardSubs];
        if (allSubs.length > 0) {
            await Promise.allSettled(allSubs.map(fn => fn(event)));
        }

        logger.debug(`📡 EventBus: ${eventType} → ${allSubs.length} local subscribers`);
        return event;
    }

    /**
     * Subscribe to an event type
     * @param {string} eventType - Event type or '*' for all
     * @param {Function} handler - (event) => void
     * @returns {Function} Unsubscribe function
     */
    subscribe(eventType, handler) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(handler);

        return () => {
            const subs = this.subscribers.get(eventType);
            const idx = subs?.indexOf(handler);
            if (idx >= 0) subs.splice(idx, 1);
        };
    }

    /**
     * Get events by type and tenant (for replay/debugging)
     * @param {object} filters
     * @returns {object[]}
     */
    query(filters = {}) {
        let results = [...this.eventLog];

        if (filters.type) {
            results = results.filter(e => e.type === filters.type);
        }
        if (filters.tenantId) {
            results = results.filter(e => e.tenantId === filters.tenantId);
        }
        if (filters.correlationId) {
            results = results.filter(e => e.correlationId === filters.correlationId);
        }

        return results;
    }

    /**
     * Replay events to a specific handler
     * @param {string} eventType
     * @param {Function} handler
     * @param {object} options
     */
    replay(eventType, handler, options = {}) {
        const events = this.query({ type: eventType });
        const limit = options.limit || events.length;
        const targetEvents = events.slice(-limit);

        for (const evt of targetEvents) {
            handler(evt);
        }
    }

    getStats() {
        return {
            totalPublished: this.totalPublished,
            activeSubscribers: Array.from(this.subscribers.keys()).length,
            logSize: this.eventLog.length,
        };
    }
}

export const eventBus = new EventBus();
export const EVENT_BUS_TYPES = EVENT_TYPES;
export { EVENT_TYPES, webhookDispatcher };
