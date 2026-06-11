import { PubSub } from '@google-cloud/pubsub';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';
import { EventEmitter } from 'events';
import { existsSync } from 'fs';

/**
 * Google Cloud Pub/Sub Service.
 * Replaces monolithic local memory/WebSocket event emitters with a
 * globally distributed, highly-durable enterprise event bus.
 * Gracefully cascades to an in-memory EventEmitter when offline.
 */
class GooglePubSubService {
    constructor() {
        this.localEmitter = new EventEmitter();
        this.localEmitter.setMaxListeners(100);
        this.isGcpConnected = false;

        // Verify GCP credentials and connection availability to avoid gRPC connection hangs during local runs or test suites
        const hasGcpCreds = (() => {
            if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
                return false;
            }
            if (process.env.PRIVATE_CLOUD_MODE === 'true') {
                return false;
            }
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                return true;
            }
            if (process.env.K_SERVICE || process.env.GAE_SERVICE || process.env.CLOUD_RUN_JOB || process.env.KUBERNETES_SERVICE_HOST) {
                return true;
            }
            return false;
        })();

        if (hasGcpCreds) {
            try {
                const projectId = config.gcp?.project_id || 'mock-project';
                this.pubsub = new PubSub({ projectId });
                this.isGcpConnected = true;
                logger.info('📡 [PubSub] Google Cloud Pub/Sub Client initialized.');
            } catch (error) {
                logger.warn(`⚠️ [PubSub] GCS/PubSub auth unavailable: ${error.message}. Activating local EventEmitter fallback.`);
                this.isGcpConnected = false;
            }
        } else {
            logger.info('📡 [PubSub] GCP credentials not active or local environment. Activating local EventEmitter fallback.');
            this.isGcpConnected = false;
        }
    }

    /**
     * Publishes a telemetry event to a Pub/Sub topic globally, cascading to local EventEmitter when offline.
     * @param {string} topicName - The target topic
     * @param {object} payload - The telemetry data
     * @returns {Promise<string>} Message ID or local identifier
     */
    async publishEvent(topicName, payload) {
        logger.info(`📤 [PubSub] Publishing event to topic: ${topicName}...`);
        
        if (this.isGcpConnected && this.pubsub) {
            try {
                const dataBuffer = Buffer.from(JSON.stringify(payload));
                const messageId = await this.pubsub.topic(topicName).publishMessage({ data: dataBuffer });
                logger.info(`✅ [PubSub] Event published to GCP topic: ${topicName}. Message ID: ${messageId}`);
                
                // Also trigger local listeners for consistency within the same node process
                this.localEmitter.emit(topicName, payload);
                return messageId;
            } catch (error) {
                logger.warn(`⚠️ [PubSub] Failed to publish event to GCP topic ${topicName}: ${error.message}. Cascading to local emitter.`);
            }
        }

        // Local Sandbox Fallback
        try {
            const localMessageId = `mock-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Route locally asynchronously to mimic network routing behavior
            setImmediate(() => {
                this.localEmitter.emit(topicName, payload);
            });
            logger.info(`💾 [PubSub Fallback] Distributed event emitted locally to topic "${topicName}":`, JSON.stringify(payload));
            return localMessageId;
        } catch (localErr) {
            logger.error(`❌ [PubSub Fallback] Local emit failed: ${localErr.message}`);
            return null;
        }
    }

    /**
     * Subscribes a microservice to a global Pub/Sub topic, falling back to local EventEmitter.
     * Supports both subscribe(subName, messageHandler) and subscribe(subName, topicName, messageHandler).
     * @param {string} subscriptionName - Name of the subscription
     * @param {string|function} topicOrHandler - The topic name to route when offline, or the handler function
     * @param {function} [maybeHandler] - Handler for parsed data if topic name is explicitly passed
     */
    async subscribe(subscriptionName, topicOrHandler, maybeHandler) {
        let topicName = null;
        let messageHandler = null;

        if (typeof topicOrHandler === 'function') {
            messageHandler = topicOrHandler;
            // Infer topic name from subscriptionName
            // If subscriptionName is e.g. "alti-swarm-events-sub", topic is "alti-swarm-events"
            topicName = subscriptionName.endsWith('-sub') 
                ? subscriptionName.slice(0, -4) 
                : subscriptionName;
        } else {
            topicName = topicOrHandler;
            messageHandler = maybeHandler;
        }

        if (this.isGcpConnected && this.pubsub) {
            try {
                const subscription = this.pubsub.subscription(subscriptionName);
                subscription.on('message', message => {
                    try {
                        const parsedData = JSON.parse(message.data.toString());
                        messageHandler(parsedData);
                        message.ack();
                    } catch (parseErr) {
                        logger.error(`❌ [PubSub] JSON parse error on message: ${parseErr.message}`);
                    }
                });
                
                subscription.on('error', error => {
                    logger.error(`❌ [PubSub] Subscription Error on ${subscriptionName}:`, error.message);
                });
                
                logger.info(`📥 [PubSub] Subscribed globally to GCP subscription: ${subscriptionName}`);
            } catch (error) {
                logger.warn(`⚠️ [PubSub] Failed to attach subscription ${subscriptionName} to GCP Pub/Sub: ${error.message}. Routing locally.`);
            }
        }

        // Register the local listener as well, for hybrid capability and offline fallback.
        this.localEmitter.on(topicName, (payload) => {
            try {
                messageHandler(payload);
            } catch (err) {
                logger.error(`❌ [PubSub Fallback] Local handler crashed: ${err.message}`);
            }
        });
        logger.info(`📥 [PubSub Fallback] Registered local listener for topic: "${topicName}" (sub: ${subscriptionName})`);
    }
}

export const pubsubService = new GooglePubSubService();
