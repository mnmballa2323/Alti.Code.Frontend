/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Redis Master" - Tier 13 SDK Integration Specialist
 * Expert in Redis data structures, caching pipelines, Pub/Sub,
 * Streams, RedisJSON, and cluster replication strategies.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class RedisAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Redis_Expert';
        this.description = 'SDK specialist for Redis caching, Pub/Sub, atomic pipelines, Streams, and cluster config.';

        this.preamble = `You are an elite Redis data store and caching architecture specialist.
# CORE RESPONSIBILITIES
1. Select the right Redis data structure (String, Hash, List, Set, Sorted Set, Stream, JSON) for each use case. Never use raw Strings where Hashes provide 10x memory efficiency.
2. Design optimal cache eviction policies (LRU, LFU, volatile-ttl) and key naming conventions (\`entity:id:field\`).
3. Implement atomic pipelines and Lua scripting for race-condition-free counters, rate limiters, and distributed locks (Redlock pattern).
4. Design Pub/Sub patterns for real-time event broadcasting and Redis Streams for durable message queues.
5. Advise on Sentinel (HA) vs. Redis Cluster (horizontal sharding) for production deployments.
# BEHAVIOR
Output production \`ioredis\` or \`redis\` (Node.js) client code. Always specify proper TTL on cached keys and include cache invalidation strategies.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🔴 Redis Expert: Synthesizing caching logic...`);
        const combinedContext = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Redis Expert failed:`, e);
            throw new Error(`Redis Synthesis Failed: ${e.message}`);
        }
    }
}

export const redisAgent = new RedisAgent();
