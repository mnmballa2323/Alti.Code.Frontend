import Redis from 'ioredis';
import { logger } from '../../../shared/logger.js';
import { SecretManagerService } from './secretManager.service.js';

class GoogleCloudMemorystoreService {
    constructor() {
        this.publisher = null;
        this.subscriber = null;
        this.isInitialized = false;
        this.messageCallbacks = new Map();
        this.init();
    }

    async init() {
        try {
            // In GCP, Memorystore IP is typically provided via environment variables or VPC configuration
            const redisHost = process.env.REDIS_HOST || '10.0.0.3';
            const redisPort = process.env.REDIS_PORT || 6379;
            
            // Fetch the password securely from Google Secret Manager
            let redisPassword = process.env.REDIS_PASSWORD;
            if (!redisPassword) {
                try {
                    redisPassword = await SecretManagerService.getSecret('redis-password');
                } catch (e) {
                    logger.warn(`⚠️ Could not fetch Redis password from Secret Manager: ${e.message}. Using default/empty.`);
                }
            }

            const redisOptions = {
                host: redisHost,
                port: redisPort,
                password: redisPassword,
                retryStrategy: (times) => {
                    return Math.min(times * 50, 2000);
                }
            };

            this.publisher = new Redis(redisOptions);
            this.subscriber = new Redis(redisOptions);

            this.publisher.on('error', (err) => logger.error(`❌ Memorystore Publisher Error: ${err.message}`));
            this.subscriber.on('error', (err) => logger.error(`❌ Memorystore Subscriber Error: ${err.message}`));

            this.subscriber.on('message', (channel, message) => {
                const callbacks = this.messageCallbacks.get(channel);
                if (callbacks) {
                    // Message is typically binary update from Yjs encoded as base64 string
                    callbacks.forEach(cb => cb(message));
                }
            });

            this.isInitialized = true;
            logger.info(`🔴 Google Cloud Memorystore (Redis) Pub/Sub initialized at ${redisHost}:${redisPort}`);
        } catch (error) {
            logger.error(`❌ Failed to initialize Cloud Memorystore: ${error.message}`);
        }
    }

    /**
     * Publish a Yjs binary update to a specific document channel
     * @param {string} docName - The CRDT document ID
     * @param {string} base64Update - The base64 encoded Yjs update
     */
    async publishCrdtUpdate(docName, base64Update) {
        if (!this.isInitialized) return;
        const channel = `crdt:${docName}`;
        try {
            await this.publisher.publish(channel, base64Update);
        } catch (error) {
            logger.error(`❌ Memorystore Publish Error on ${channel}: ${error.message}`);
        }
    }

    /**
     * Subscribe to remote CRDT updates for a specific document
     * @param {string} docName - The CRDT document ID
     * @param {Function} callback - Function to handle the base64 encoded incoming update
     */
    async subscribeToCrdt(docName, callback) {
        if (!this.isInitialized) return;
        const channel = `crdt:${docName}`;
        
        if (!this.messageCallbacks.has(channel)) {
            this.messageCallbacks.set(channel, new Set());
            try {
                await this.subscriber.subscribe(channel);
                logger.info(`📡 Subscribed to Cloud Memorystore channel: ${channel}`);
            } catch (error) {
                logger.error(`❌ Memorystore Subscribe Error on ${channel}: ${error.message}`);
            }
        }
        
        this.messageCallbacks.get(channel).add(callback);
    }

    /**
     * Set a value in the Redis cache with an optional TTL (Time To Live).
     * @param {string} key - Cache key
     * @param {string} value - Value to cache
     * @param {number} ttlSeconds - Time to live in seconds (default 3600 = 1 hour)
     */
    async setCache(key, value, ttlSeconds = 3600) {
        if (!this.isInitialized) return;
        try {
            await this.publisher.set(key, value, 'EX', ttlSeconds);
        } catch (error) {
            logger.error(`❌ Memorystore setCache Error [${key}]: ${error.message}`);
        }
    }

    /**
     * Retrieve a value from the Redis cache.
     * @param {string} key - Cache key
     * @returns {string|null} The cached value, or null if not found
     */
    async getCache(key) {
        if (!this.isInitialized) return null;
        try {
            return await this.publisher.get(key);
        } catch (error) {
            logger.error(`❌ Memorystore getCache Error [${key}]: ${error.message}`);
            return null;
        }
    }
}

export const memorystoreService = new GoogleCloudMemorystoreService();
