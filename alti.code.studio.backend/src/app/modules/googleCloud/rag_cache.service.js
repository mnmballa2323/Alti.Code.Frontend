import redis from 'redis';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Memorystore (Redis) RAG Cache Service.
 * Grants the Swarm zero-latency context recall. When the Swarm retrieves massive AST
 * sub-trees from Vertex Search, it caches them in Memorystore. If it loops back over the
 * same bug, it instantly recalls the context, drastically cutting down reasoning latency.
 */
class GoogleRagCacheService {
    constructor() {
        try {
            // Assumes Memorystore Redis instance is provisioned and VPC-peered
            this.client = redis.createClient({
                url: `redis://${config.gcp.redis_host || '10.0.0.3'}:${config.gcp.redis_port || 6379}`
            });
            
            this.client.on('error', (err) => logger.warn(`⚠️ [RAG Cache] Redis Client Error: ${err.message}`));
            this.client.connect().catch(e => logger.warn(`⚠️ [RAG Cache] Could not connect to Memorystore.`));
            
            logger.info('⚡ [RAG Cache] Google Cloud Memorystore (Redis) Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [RAG Cache] Could not initialize Memorystore Client.');
        }
    }

    /**
     * Retrieves a cached RAG context block.
     * @param {string} promptHash - A hash of the Swarm's query
     */
    async getCachedContext(promptHash) {
        try {
            const data = await this.client.get(`rag_context:${promptHash}`);
            if (data) {
                logger.info(`⚡ [RAG Cache] Zero-latency context recall successful (Cache Hit).`);
                return JSON.parse(data);
            }
            return null; // Cache miss
        } catch (error) {
            logger.error(`❌ [RAG Cache] Failed to read from Memorystore:`, error.message);
            return null;
        }
    }

    /**
     * Stores a massive AST sub-tree into Memorystore.
     * @param {string} promptHash - A hash of the Swarm's query
     * @param {object} contextData - The retrieved snippets/ASTs
     */
    async setCachedContext(promptHash, contextData) {
        try {
            // Cache expires after 1 hour to prevent stale code context
            await this.client.setEx(`rag_context:${promptHash}`, 3600, JSON.stringify(contextData));
            logger.info(`⚡ [RAG Cache] Swarm RAG context successfully cached in Memorystore.`);
        } catch (error) {
            logger.error(`❌ [RAG Cache] Failed to write to Memorystore:`, error.message);
        }
    }
}

export const ragCacheService = new GoogleRagCacheService();
