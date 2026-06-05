import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

/**
 * Decentralized LibP2P Swarm Mesh Service (Mocked)
 * Removes the centralized Redis bottleneck by allowing agents to gossip directly
 * via a resilient UDP/TCP mesh overlay.
 */
class SwarmMeshNetworkService {
    constructor() {
        this.nodeId = crypto.randomUUID();
        this.knownPeers = new Set();
        this.topics = new Map();
        this.isRunning = false;
    }

    /**
     * Bootstraps the local node into the decentralized gossip mesh.
     */
    async start() {
        if (this.isRunning) return;
        logger.info(`🌐 [Swarm Mesh] Booting P2P LibP2P node: ${this.nodeId.substring(0, 8)}...`);
        
        // Simulating UDP broadcast discovery
        setTimeout(() => {
            const peerId = crypto.randomUUID();
            this.knownPeers.add(peerId);
            logger.info(`🤝 [Swarm Mesh] Discovered peer node: ${peerId.substring(0, 8)} on local subnet.`);
        }, 1500);

        this.subscribe('TASK_DISCOVERY', async (payload) => {
            const { prompt, contextPayload, orchestrator } = payload;
            logger.info(`🕸️ [Swarm Mesh] Node ${this.nodeId.substring(0, 8)} intercepted TASK_DISCOVERY broadcast.`);
            
            try {
                // Use TriBrain Router to deduce the single best agent out of 18,989
                const routingPrompt = `We have 18,989 highly specialized technical agents on disk named exactly like 'python.agent.js', 'dwdm_optical.agent.js', 'docker.agent.js', 'react.agent.js', 'kubernetes.agent.js', etc.
Based on the following request, deduce the EXACT base name of the agent most qualified to handle it (do NOT include .agent.js, just the raw snake_case or lowercase word).
Return NOTHING BUT THE RAW NAME.
Request: ${prompt.substring(0, 500)}`;
                
                const { triBrainService } = await import('./tri_brain.service.js');
                const agentNameRaw = await triBrainService.fastInference(routingPrompt);
                const agentName = agentNameRaw.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
                
                const agentFilePath = `./${agentName}.agent.js`;
                const fs = await import('fs');
                const path = await import('path');
                const url = await import('url');
                
                const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
                const fullPath = path.join(__dirname, agentFilePath);
                
                if (fs.existsSync(fullPath)) {
                    logger.info(`🔥 [Swarm Mesh] Dynamic Mesh Resolution hit! Lazy-loading agent: ${agentName}.agent.js into memory...`);
                    
                    const module = await import(agentFilePath);
                    const AgentInstance = Object.values(module).find(val => val && typeof val.consult === 'function');
                    
                    if (AgentInstance) {
                        logger.info(`🚀 [Swarm Mesh] Activating autonomous agent execution via dynamic P2P dispatch...`);
                        // The agent's generateContent call is automatically intercepted globally!
                        const solution = await AgentInstance.consult(prompt, contextPayload);
                        logger.info(`✅ [Swarm Mesh] Agent ${agentName} executed successfully via P2P Mesh.`);
                        
                        // Re-broadcast the solution back to the GodModeOrchestrator topic
                        this.broadcast('TASK_SOLUTION', { solution, agent: agentName });
                    }
                } else {
                    logger.warn(`⚠️ [Swarm Mesh] Agent ${agentName}.agent.js not found in local replica. Ignoring payload...`);
                }
            } catch (err) {
                logger.error(`❌ [Swarm Mesh] Decentralized execution error:`, err);
            }
        });

        this.isRunning = true;
    }

    /**
     * Subscribes the current node to a specific topic within the gossip mesh.
     * @param {string} topic 
     * @param {Function} handler 
     */
    subscribe(topic, handler) {
        if (!this.topics.has(topic)) {
            this.topics.set(topic, []);
        }
        this.topics.get(topic).push(handler);
        logger.info(`📡 [Swarm Mesh] Subscribed to topic: ${topic}`);
    }

    /**
     * Broadcasts a "Help Wanted" payload to all neighboring nodes in the swarm.
     * @param {string} topic 
     * @param {Object} payload 
     */
    broadcast(topic, payload) {
        logger.info(`📢 [Swarm Mesh] Gossiping payload to ${this.knownPeers.size} peers on topic: ${topic}`);
        
        // Simulate local reflection for demo purposes
        if (this.topics.has(topic)) {
            const handlers = this.topics.get(topic);
            for (const handler of handlers) {
                // Async dispatch to prevent blocking
                setImmediate(() => handler(payload));
            }
        }
    }
}

export const swarmMeshNetworkService = new SwarmMeshNetworkService();
