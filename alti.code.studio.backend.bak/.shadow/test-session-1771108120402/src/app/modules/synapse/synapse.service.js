import { createClient } from 'redis';
import axios from 'axios';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

// Synapse: The Agent Interaction Layer
// Implements A2A (Agent-to-Agent) patterns using Redis & HTTP
// Fallback: In-Memory Mock Mode if Redis is unavailable.

let publisher = null;
let subscriber = null;
let isConnected = false;
let isMock = false;

// Mock Registry for fallback
const mockRegistry = new Map();

const REGISTRY_KEY = 'synapse:registry';
const BROADCAST_CHANNEL = 'synapse:broadcast';

const init = async () => {
    if (isConnected) return;

    try {
        const redisUrl = config.redis.url || 'redis://localhost:6379';

        // Create clients but don't connect immediately
        publisher = createClient({ url: redisUrl });
        subscriber = createClient({ url: redisUrl });

        // Error handlers to prevent crashing on connection failure
        publisher.on('error', (err) => {
            if (!isMock) logger.warn(`Redis Publisher Error: ${err.message}`);
        });
        subscriber.on('error', (err) => {
            if (!isMock) logger.warn(`Redis Subscriber Error: ${err.message}`);
        });

        // Connection with timeout
        const connectionPromise = Promise.all([publisher.connect(), subscriber.connect()]);
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis Connection Timeout')), 2000)
        );

        await Promise.race([connectionPromise, timeoutPromise]);

        // Listen for system-wide broadcasts
        await subscriber.subscribe(BROADCAST_CHANNEL, (message) => {
            try {
                const { from, type, payload } = JSON.parse(message);
                logger.info(`📡 [Synapse] Broadcast received from ${from}: ${type}`, payload);
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
        // Ensure clients are closed if they were partially opened
        // try { await publisher.disconnect(); await subscriber.disconnect(); } catch (e) {}
    }
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
        if (data.capabilities.includes(capability)) {
            return data;
        }
    }
    return null;
};

const broadcastMessage = async (fromAgent, messageType, payload) => {
    if (!isConnected) await init();

    logger.info(`📢 Broadcast from ${fromAgent}: [${messageType}]`);

    const message = JSON.stringify({
        from: fromAgent,
        type: messageType,
        payload,
        timestamp: new Date().toISOString()
    });

    if (isMock) {
        // Echo to self (mocking broadcast)
        logger.info(`📡 [Synapse MOCK] Broadcast received from ${fromAgent}: ${messageType}`, payload);
        return {
            broadcastId: 'bc-mock-' + Date.now(),
            recipients: 1
        };
    } else {
        const clients = await publisher.publish(BROADCAST_CHANNEL, message);
        return {
            broadcastId: 'bc-' + Date.now(),
            recipients: clients
        };
    }
};

const directMessage = async (fromAgent, toAgentName, payload) => {
    if (!isConnected) await init();

    logger.info(`📨 Direct message from ${fromAgent} to ${toAgentName}`);

    // 1. Resolve Target
    let targetStr = null;
    if (isMock) {
        targetStr = mockRegistry.get(toAgentName);
    } else {
        targetStr = await publisher.hGet(REGISTRY_KEY, toAgentName);
    }

    if (!targetStr) {
        throw new Error(`Agent ${toAgentName} not found in registry`);
    }
    const target = JSON.parse(targetStr);

    // 2. Send HTTP Request
    try {
        const response = await axios.post(target.endpoint, {
            from: fromAgent,
            payload
        });

        return {
            from: toAgentName,
            to: fromAgent,
            response: response.data
        };
    } catch (error) {
        logger.error(`Failed to message ${toAgentName} at ${target.endpoint}`, error.message);
        throw error;
    }
};

export const SynapseService = {
    init,
    registerAgent,
    findAgent,
    broadcastMessage,
    directMessage
};
