import Redis from 'ioredis';
import { logger } from '../../../shared/logger.js';

class AzureCacheService {
    constructor() {
        this.publisher = null;
        this.subscriber = null;
        this.isInitialized = false;
        this.fallbackCache = new Map();
        this.messageCallbacks = new Map();
        this.init();
    }

    async init() {
        if (process.env.DISABLE_REDIS === 'true') {
            this.isInitialized = false;
            return;
        }

        try {
            // Azure Cache for Redis configuration
            const redisHost = process.env.AZURE_REDIS_HOST || process.env.REDIS_HOST || '127.0.0.1';
            const redisPort = process.env.AZURE_REDIS_PORT || process.env.REDIS_PORT || 6379;
            const redisPassword = process.env.AZURE_REDIS_PASSWORD || process.env.REDIS_PASSWORD || null;

            const redisOptions = {
                host: redisHost,
                port: redisPort,
                password: redisPassword,
                retryStrategy: (times) => {
                    if (times > 3) {
                        logger.warn(`⚠️ Azure Cache Redis connection failed after ${times - 1} retries. Falling back to local in-memory store.`);
                        this.isInitialized = false;
                        return null; // Stop retrying
                    }
                    return Math.min(times * 100, 1000);
                }
            };

            this.publisher = new Redis(redisOptions);
            this.subscriber = new Redis(redisOptions);

            this.publisher.on('error', (err) => {
                logger.error(`❌ Azure Cache Publisher Error: ${err.message}`);
            });
            this.subscriber.on('error', (err) => {
                logger.error(`❌ Azure Cache Subscriber Error: ${err.message}`);
            });

            this.subscriber.on('message', (channel, message) => {
                const callbacks = this.messageCallbacks.get(channel);
                if (callbacks) {
                    callbacks.forEach(cb => cb(message));
                }
            });

            this.isInitialized = true;
            logger.info(`🔴 Azure Cache for Redis Pub/Sub initialized at ${redisHost}:${redisPort}`);
        } catch (error) {
            logger.error(`❌ Failed to initialize Azure Cache: ${error.message}`);
            this.isInitialized = false;
        }
    }

    async publishCrdtUpdate(docName, base64Update) {
        const channel = `crdt:${docName}`;
        const localCallbacks = this.messageCallbacks.get(channel);
        if (localCallbacks) {
            localCallbacks.forEach(cb => cb(base64Update));
        }

        if (!this.isInitialized) return;
        try {
            await this.publisher.publish(channel, base64Update);
        } catch (error) {
            logger.error(`❌ Azure Cache Publish Error on ${channel}: ${error.message}`);
        }
    }

    async subscribeToCrdt(docName, callback) {
        const channel = `crdt:${docName}`;
        
        if (!this.messageCallbacks.has(channel)) {
            this.messageCallbacks.set(channel, new Set());
            if (this.isInitialized) {
                try {
                    await this.subscriber.subscribe(channel);
                    logger.info(`📡 Subscribed to Azure Cache channel: ${channel}`);
                } catch (error) {
                    logger.error(`❌ Azure Cache Subscribe Error on ${channel}: ${error.message}`);
                }
            }
        }
        
        this.messageCallbacks.get(channel).add(callback);
    }

    async setCache(key, value, ttlSeconds = 3600) {
        this.fallbackCache.set(key, {
            value,
            expiry: Date.now() + (ttlSeconds * 1000)
        });

        if (!this.isInitialized) return;
        try {
            await this.publisher.set(key, value, 'EX', ttlSeconds);
        } catch (error) {
            logger.error(`❌ Azure Cache setCache Error [${key}]: ${error.message}`);
        }
    }

    async getCache(key) {
        if (!this.isInitialized) {
            const entry = this.fallbackCache.get(key);
            if (entry) {
                if (entry.expiry > Date.now()) {
                    return entry.value;
                }
                this.fallbackCache.delete(key);
            }
            return null;
        }

        try {
            return await this.publisher.get(key);
        } catch (error) {
            logger.error(`❌ Azure Cache getCache Error [${key}]: ${error.message}`);
            const entry = this.fallbackCache.get(key);
            if (entry) {
                if (entry.expiry > Date.now()) {
                    return entry.value;
                }
                this.fallbackCache.delete(key);
            }
            return null;
        }
    }

    /**
     * Retrieves a cached RAG context block.
     * @param {string} promptHash - A hash of the Swarm's query
     */
    async getCachedContext(promptHash) {
        try {
            const data = await this.getCache(`rag_context:${promptHash}`);
            if (data) {
                logger.info(`⚡ [Azure RAG Cache] Zero-latency context recall successful (Cache Hit).`);
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            logger.error(`❌ [Azure RAG Cache] Failed to read RAG cache:`, error.message);
            return null;
        }
    }

    /**
     * Stores a context block in the cache.
     * @param {string} promptHash - A hash of the Swarm's query
     * @param {object} contextData - The retrieved snippets/ASTs
     */
    async setCachedContext(promptHash, contextData) {
        try {
            await this.setCache(`rag_context:${promptHash}`, JSON.stringify(contextData), 3600);
            logger.info(`⚡ [Azure RAG Cache] Swarm RAG context successfully cached.`);
        } catch (error) {
            logger.error(`❌ [Azure RAG Cache] Failed to write RAG cache:`, error.message);
        }
    }
}

export const azureCacheService = new AzureCacheService();
// Compatibility aliases to ease routing transition
export const memorystoreService = azureCacheService;
export const ragCacheService = azureCacheService;

