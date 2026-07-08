import Redis from 'ioredis';
import { logger } from '../../../shared/logger.js';

class GcpCacheService {
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
      const redisHost =
        process.env.GCP_REDIS_HOST || process.env.REDIS_HOST || '127.0.0.1';
      const redisPort =
        process.env.GCP_REDIS_PORT || process.env.REDIS_PORT || 6379;
      const redisPassword =
        process.env.GCP_REDIS_PASSWORD || process.env.REDIS_PASSWORD || null;

      const redisOptions = {
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        retryStrategy: times => {
          if (times > 3) {
            logger.warn(
              `⚠️ GCP Memorystore connection failed after ${times - 1} retries. Falling back to local in-memory store.`,
            );
            this.isInitialized = false;
            return null;
          }
          return Math.min(times * 100, 1000);
        },
      };

      this.publisher = new Redis(redisOptions);
      this.subscriber = new Redis(redisOptions);

      this.publisher.on('error', err => {
        logger.error(`❌ GCP Memorystore Publisher Error: ${err.message}`);
      });
      this.subscriber.on('error', err => {
        logger.error(`❌ GCP Memorystore Subscriber Error: ${err.message}`);
      });

      this.subscriber.on('message', (channel, message) => {
        const callbacks = this.messageCallbacks.get(channel);
        if (callbacks) {
          callbacks.forEach(cb => cb(message));
        }
      });

      this.isInitialized = true;
      logger.info(
        `🔴 GCP Memorystore for Redis Pub/Sub initialized at ${redisHost}:${redisPort}`,
      );
    } catch (error) {
      logger.error(`❌ Failed to initialize GCP Memorystore: ${error.message}`);
      this.isInitialized = false;
    }
  }

  /**
   * Publish a CRDT update
   */
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
      logger.error(
        `❌ GCP Memorystore Publish Error on ${channel}: ${error.message}`,
      );
    }
  }

  /**
   * Subscribe to CRDT updates
   */
  async subscribeToCrdt(docName, callback) {
    const channel = `crdt:${docName}`;

    if (!this.messageCallbacks.has(channel)) {
      this.messageCallbacks.set(channel, new Set());
      if (this.isInitialized) {
        try {
          await this.subscriber.subscribe(channel);
          logger.info(`📡 Subscribed to GCP Memorystore channel: ${channel}`);
        } catch (error) {
          logger.error(
            `❌ GCP Memorystore Subscribe Error on ${channel}: ${error.message}`,
          );
        }
      }
    }

    this.messageCallbacks.get(channel).add(callback);
  }

  /**
   * Set cache entry
   */
  async setCache(key, value, ttlSeconds = 3600) {
    this.fallbackCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });

    if (!this.isInitialized) return;
    try {
      await this.publisher.set(key, value, 'EX', ttlSeconds);
    } catch (error) {
      logger.error(
        `❌ GCP Memorystore setCache Error [${key}]: ${error.message}`,
      );
    }
  }

  /**
   * Get cache entry
   */
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
      logger.error(
        `❌ GCP Memorystore getCache Error [${key}]: ${error.message}`,
      );
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
   * Get cached RAG context block
   */
  async getCachedContext(promptHash) {
    try {
      const data = await this.getCache(`rag_context:${promptHash}`);
      if (data) {
        logger.info(
          `⚡ [GCP RAG Cache] Zero-latency context recall successful (Cache Hit).`,
        );
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      logger.error(
        `❌ [GCP RAG Cache] Failed to read RAG cache:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Set cached RAG context block
   */
  async setCachedContext(promptHash, contextData) {
    try {
      await this.setCache(
        `rag_context:${promptHash}`,
        JSON.stringify(contextData),
        3600,
      );
      logger.info(`⚡ [GCP RAG Cache] Swarm RAG context successfully cached.`);
    } catch (error) {
      logger.error(
        `❌ [GCP RAG Cache] Failed to write RAG cache:`,
        error.message,
      );
    }
  }
}

export const gcpCacheService = new GcpCacheService();
export const memorystoreService = gcpCacheService;
export const ragCacheService = gcpCacheService;
