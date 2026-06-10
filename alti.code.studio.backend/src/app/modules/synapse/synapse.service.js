/**
 * Copyright (c) 2024 Inso Code
 * 
 * Synapse: The Agent Interaction Layer
 */

import { createClient } from 'redis';
import crypto from 'crypto';
import axios from 'axios';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import { EventEmitter } from 'events';

// Imports for Local/Mock Mode
// import { surferAgent } from '../agents/surfer.agent.js';
import { healerAgent } from '../agents/healer.agent.js';
import { prophetAgent } from '../agents/prophet.agent.js';
import { breakerAgent } from '../agents/breaker.agent.js';
import { polyglotAgent } from '../agents/polyglot.agent.js';
import { engineAgent } from '../agents/engine.agent.js';
import { strategistAgent } from '../agents/strategist.agent.js';
import { criticAgent } from '../agents/critic.agent.js';
import { architectAgent } from '../agents/architect.agent.js';
import { composerAgent } from '../agents/composer.agent.js';
import { guardianAgent } from '../agents/guardian.agent.js';
import { diplomatAgent } from '../agents/diplomat.agent.js';
import { historianAgent } from '../agents/historian.agent.js';
import { analystAgent } from '../agents/analyst.agent.js';

let publisher = null;
let subscriber = null;
let isConnected = false;
let isMock = false;

// Mock Registry for fallback
const mockRegistry = new Map();
const instanceRegistry = new Map(); // Stores actual instances for Mock Mode
const sessionStore = new Map(); // Stores session memory for Mock Mode

const REGISTRY_KEY = 'synapse:registry';
const BROADCAST_CHANNEL = 'synapse:broadcast';

// Event Emitter for SSE
const eventBus = new EventEmitter();

// ... (init) ...

const setMemory = async (sessionId, key, value) => {
    if (!isConnected) await init();
    logger.info(`💾 Synapse: Memory Set [${sessionId}] ${key}`);

    if (isMock) {
        if (!sessionStore.has(sessionId)) {
            sessionStore.set(sessionId, new Map());
        }
        sessionStore.get(sessionId).set(key, value);
    } else {
        await publisher.hSet(`session:${sessionId}`, key, JSON.stringify(value));
    }
};

const getMemory = async (sessionId, key) => {
    if (!isConnected) await init();

    if (isMock) {
        if (!sessionStore.has(sessionId)) return null;
        return sessionStore.get(sessionId).get(key);
    } else {
        const val = await publisher.hGet(`session:${sessionId}`, key);
        return val ? JSON.parse(val) : null;
    }
};

const init = async () => {
    if (isConnected) return;

    if (process.env.DISABLE_REDIS === 'true') {
        logger.warn('⚠️ Synapse: Redis disabled via env. Switching to local in-memory Mock Mode.');
        isConnected = true;
        isMock = true;

        registerLocalAgent(healerAgent);
        registerLocalAgent(prophetAgent);
        registerLocalAgent(breakerAgent);
        registerLocalAgent(polyglotAgent);
        registerLocalAgent(engineAgent);
        registerLocalAgent(strategistAgent);
        registerLocalAgent(criticAgent);
        registerLocalAgent(architectAgent);
        registerLocalAgent(composerAgent);
        registerLocalAgent(guardianAgent);
        registerLocalAgent(diplomatAgent);
        registerLocalAgent(historianAgent);
        registerLocalAgent(analystAgent);
        return;
    }

    try {
        const redisUrl = config.redis.url || 'redis://localhost:6379';

        publisher = createClient({ url: redisUrl });
        subscriber = createClient({ url: redisUrl });

        publisher.on('error', (err) => {
            if (!isMock) logger.warn(`Redis Publisher Error: ${err.message}`);
        });
        subscriber.on('error', (err) => {
            if (!isMock) logger.warn(`Redis Subscriber Error: ${err.message}`);
        });

        const connectionPromise = Promise.all([publisher.connect(), subscriber.connect()]);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis Connection Timeout')), 2000)
        );

        await Promise.race([connectionPromise, timeoutPromise]);

        await subscriber.subscribe(BROADCAST_CHANNEL, (message) => {
            try {
                const { from, type, payload } = JSON.parse(message);
                logger.info(`📡 [Synapse] Broadcast received from ${from}: ${type}`, payload);
                eventBus.emit('broadcast', { from, type, payload });
            } catch (e) {
                logger.error('Failed to process broadcast', e);
            }
        });

        isConnected = true;
        isMock = false;
        logger.info('🧠 Synapse Connected (Redis)');

    } catch (error) {
        logger.warn('⚠️ Synapse: Redis unreachable. Switching to local in-memory Mock Mode.');
        isConnected = true;
        isMock = true;

        // Auto-register local agents in Mock Mode
        // registerLocalAgent(surferAgent);
        registerLocalAgent(healerAgent);
        registerLocalAgent(prophetAgent);
        registerLocalAgent(breakerAgent);
        registerLocalAgent(polyglotAgent);
        registerLocalAgent(engineAgent);
        registerLocalAgent(strategistAgent);
        registerLocalAgent(criticAgent);
        registerLocalAgent(architectAgent);
        registerLocalAgent(composerAgent);
        registerLocalAgent(guardianAgent);
        registerLocalAgent(diplomatAgent);
        registerLocalAgent(historianAgent);
        registerLocalAgent(analystAgent);
    }
};

const registerLocalAgent = (agent) => {
    if (!agent) return;
    const listing = {
        agentName: agent.agentName,
        capabilities: agent.capabilities,
        endpoint: 'local', // Marker for local execution
    };
    mockRegistry.set(agent.agentName, JSON.stringify(listing));
    instanceRegistry.set(agent.agentName, agent);
};

const registerAgent = async (agentName, capabilities, endpoint) => {
    if (!isConnected) await init();

    const listing = {
        agentName,
        capabilities,
        endpoint,
        lastSeen: new Date().toISOString()
    };

    logger.info(`📝 Registering agent: ${agentName}`, listing);

    if (isMock) {
        mockRegistry.set(agentName, JSON.stringify(listing));
    } else {
        await publisher.hSet(REGISTRY_KEY, agentName, JSON.stringify(listing));
    }

    return { status: 'registered', agentName };
};

const findAgent = async (capability) => {
    if (!isConnected) await init();

    let allAgents = {};

    if (isMock) {
        allAgents = Object.fromEntries(mockRegistry);
    } else {
        allAgents = await publisher.hGetAll(REGISTRY_KEY);
    }

    for (const [name, dataStr] of Object.entries(allAgents)) {
        const data = JSON.parse(dataStr);
        if (data.capabilities?.includes(capability)) {
            // Include instance if it exists (Local Mock Mode)
            if (isMock && instanceRegistry.has(data.agentName)) {
                return instanceRegistry.get(data.agentName);
            }
            return data;
        }
    }
    return null;
};

const getAllAgents = async () => {
    if (!isConnected) await init();

    try {
        if (isMock) {
            const agents = [];
            for (const [name, dataStr] of mockRegistry.entries()) {
                agents.push(JSON.parse(dataStr));
            }
            return agents;
        } else {
            const allAgents = await publisher.hGetAll(REGISTRY_KEY);
            return Object.values(allAgents).map(dataStr => JSON.parse(dataStr));
        }
    } catch (error) {
        logger.error("Failed to get all agents", error);
        return [];
    }
};

const broadcastMessage = async (fromAgent, messageType, payload) => {
    if (!isConnected) await init();

    const message = JSON.stringify({
        from: fromAgent,
        type: messageType,
        payload,
        timestamp: new Date().toISOString()
    });

    if (isMock) {
        eventBus.emit('broadcast', { from: fromAgent, type: messageType, payload });
        return { broadcastId: `bc-${crypto.randomUUID()}`, recipients: 1 };
    } else {
        const clients = await publisher.publish(BROADCAST_CHANNEL, message);
        return { broadcastId: `bc-${crypto.randomUUID()}`, recipients: clients };
    }

};

const directMessage = async (fromAgent, toAgentName, payload) => {
    if (!isConnected) await init();

    const channel = `synapse:dm:${toAgentName}`;
    const message = JSON.stringify({ from: fromAgent, payload, timestamp: new Date().toISOString() });

    if (isMock) {
        // Deliver directly to the local agent instance if available
        const targetInstance = instanceRegistry.get(toAgentName);
        if (targetInstance?.receiveMessage) {
            await targetInstance.receiveMessage({ from: fromAgent, payload });
            return { status: 'delivered', to: toAgentName };
        }
        // Fallback: emit on the shared eventBus
        eventBus.emit(`dm:${toAgentName}`, { from: fromAgent, payload });
        return { status: 'sent (local-event)', to: toAgentName };
    }

    const delivered = await publisher.publish(channel, message);
    return { status: delivered > 0 ? 'delivered' : 'no_subscribers', to: toAgentName };
};

const swarm = async (taskDescription, requiredCapabilities = []) => {
    if (!isConnected) await init();

    logger.info(`🐝 Synapse: Forming Swarm for task: "${taskDescription}"`);

    let agents = await getAllAgents();
    let squad = agents.filter(a =>
        requiredCapabilities.some(cap => a.capabilities?.includes(cap))
    );

    // Special handling for Strategist/Critic discovery
    const planningAgent = await findAgent('planning');
    if (planningAgent && requiredCapabilities.includes('planning') && !squad.find(a => a.agentName === planningAgent.agentName)) {
        squad.push(planningAgent);
    }

    logger.info(`🐝 Synapse: Swarm Squad Assembled: [${squad.map(a => a.agentName).join(', ')}]`);

    const results = await Promise.all(squad.map(async (agent) => {
        try {
            // Execute locally if the agent instance is in the registry (mock mode)
            if (isMock && instanceRegistry.has(agent.agentName)) {
                const instance = instanceRegistry.get(agent.agentName);
                const result = await instance.process?.({ goal: taskDescription, results: [] });
                return { agent: agent.agentName, status: 'executed', result };
            }
            // In Redis mode: fire-and-forget via broadcast (agent will pick up via subscription)
            return { agent: agent.agentName, status: 'acknowledged' };
        } catch (e) {
            return { agent: agent.agentName, error: e.message, status: 'failed' };
        }
    }));

    return {
        swarmId: crypto.randomUUID(),
        squad: squad.map(a => a.agentName),
        results,
    };

};

export const SynapseService = {
    init,
    registerAgent,
    findAgent,
    getAllAgents,
    broadcastMessage,
    directMessage,
    swarm,
    getMemory,
    setMemory,
    subscribeToEvents: (cb) => {
        eventBus.on('broadcast', cb);
        return () => eventBus.off('broadcast', cb);
    }
};
