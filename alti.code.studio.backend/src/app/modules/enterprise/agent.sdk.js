/**
 * Copyright (c) 2024 Inso Code
 * 
 * AGENT SDK — Developer Platform for Agent Interaction
 * 
 * This module provides:
 *   - Agent versioning + rollback
 *   - Custom agent builder (define agents via API)
 *   - Agent marketplace registry
 *   - Programmatic SDK interface
 * 
 * Usage:
 *   const agent = agentSDK.get('cssArchitect');
 *   const result = await agent.run({ code: 'body {}', task: 'Optimize' });
 */

import { agentRegistry } from '../agents/agent.registry.js';
import { legionFactory } from '../legion/legion.factory.js';
import { eventBus, EVENT_TYPES } from './event.bus.js';
import { logger } from '../../../shared/logger.js';

class AgentSDK {
    constructor() {
        /** @type {Map<string, object[]>} agentName → version history */
        this.versions = new Map();
        /** @type {Map<string, object>} custom agent definitions */
        this.customAgents = new Map();
        /** @type {Map<string, object>} marketplace listings */
        this.marketplace = new Map();
    }

    /**
     * Get an agent handle for programmatic use
     * @param {string} name - Agent name
     * @returns {object} Agent handle with .run() method
     */
    get(name) {
        const agent = agentRegistry.get(name);
        if (!agent) throw new Error(`Agent "${name}" not found`);

        const processor = legionFactory.getProcessor(name);

        return {
            name: agent.name,
            description: agent.description,
            capabilities: agent.capabilities,
            version: this._getCurrentVersion(name),

            /**
             * Run the agent with input
             * @param {object} input - { code, task, context, ...rest }
             * @returns {Promise<object>} Agent result
             */
            run: async (input) => {
                const startTime = Date.now();
                const jobId = `sdk_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                try {
                    let result;
                    if (processor) {
                        result = await processor({ id: jobId, data: input });
                    } else {
                        result = { agent: name, result: 'Processor not available via SDK', status: 'stub' };
                    }

                    await eventBus.publish(EVENT_TYPES.AGENT_COMPLETED, {
                        agentName: name, jobId, durationMs: Date.now() - startTime,
                    });

                    return result;
                } catch (err) {
                    await eventBus.publish(EVENT_TYPES.AGENT_FAILED, {
                        agentName: name, jobId, error: err.message,
                    });
                    throw err;
                }
            },
        };
    }

    /**
     * Define a custom agent (tenant-scoped)
     * @param {object} definition - { name, description, prompt, capabilities, squad }
     * @param {string} tenantId
     * @returns {object} The registered agent
     */
    defineCustomAgent(definition, tenantId) {
        const name = `custom_${tenantId}_${definition.name}`;
        const agent = {
            ...definition,
            name,
            tenantId,
            type: 'custom',
            version: '1.0.0',
            createdAt: new Date().toISOString(),
        };

        this.customAgents.set(name, agent);

        // Register in the main registry
        agentRegistry.register({
            name,
            description: definition.description,
            queue: `${name}-queue`,
            capabilities: definition.capabilities || [],
            version: '1.0.0',
            type: 'custom',
        });

        logger.info(`🎨 AgentSDK: Custom agent "${name}" created by tenant ${tenantId}`);
        return agent;
    }

    /**
     * Version an agent's prompt/config
     * @param {string} agentName
     * @param {object} update - { prompt, capabilities, description }
     * @returns {string} New version number
     */
    publishVersion(agentName, update) {
        if (!this.versions.has(agentName)) this.versions.set(agentName, []);

        const history = this.versions.get(agentName);
        const version = `${history.length + 1}.0.0`;

        history.push({
            version,
            update,
            publishedAt: new Date().toISOString(),
            active: true,
        });

        // Deactivate previous versions
        for (let i = 0; i < history.length - 1; i++) {
            history[i].active = false;
        }

        logger.info(`📦 AgentSDK: ${agentName} updated to v${version}`);
        return version;
    }

    /**
     * Rollback an agent to a previous version
     * @param {string} agentName
     * @param {string} targetVersion
     * @returns {object} Rollback result
     */
    rollback(agentName, targetVersion) {
        const history = this.versions.get(agentName);
        if (!history) throw new Error(`No version history for "${agentName}"`);

        const target = history.find(v => v.version === targetVersion);
        if (!target) throw new Error(`Version "${targetVersion}" not found for "${agentName}"`);

        // Deactivate all, activate target
        for (const v of history) v.active = false;
        target.active = true;

        logger.info(`⏪ AgentSDK: ${agentName} rolled back to v${targetVersion}`);
        return { agentName, activeVersion: targetVersion, rollbackAt: new Date().toISOString() };
    }

    /** Get current active version */
    _getCurrentVersion(name) {
        const history = this.versions.get(name);
        if (!history || history.length === 0) return '1.0.0';
        return history.find(v => v.active)?.version || history.at(-1)?.version;
    }

    /**
     * Publish agent to marketplace
     * @param {string} agentName
     * @param {object} listing - { title, description, price, category, tags }
     */
    publishToMarketplace(agentName, listing) {
        const entry = {
            agentName,
            ...listing,
            publishedAt: new Date().toISOString(),
            installs: 0,
            rating: 0,
            reviews: 0,
        };
        this.marketplace.set(agentName, entry);
        logger.info(`🏪 Marketplace: "${agentName}" published`);
        return entry;
    }

    /** Search marketplace */
    searchMarketplace(query = {}) {
        let results = Array.from(this.marketplace.values());
        if (query.category) results = results.filter(r => r.category === query.category);
        if (query.search) {
            const term = query.search.toLowerCase();
            results = results.filter(r =>
                r.title?.toLowerCase().includes(term) ||
                r.description?.toLowerCase().includes(term) ||
                r.tags?.some(t => t.includes(term))
            );
        }
        return results;
    }

    /** Get SDK stats */
    getStats() {
        return {
            totalAgents: agentRegistry.count,
            customAgents: this.customAgents.size,
            marketplaceListings: this.marketplace.size,
            versionedAgents: this.versions.size,
        };
    }
}

export const agentSDK = new AgentSDK();
