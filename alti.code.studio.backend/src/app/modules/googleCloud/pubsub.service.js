import { PubSub } from '@google-cloud/pubsub';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Pub/Sub Service.
 * Replaces monolithic local memory/WebSocket event emitters with a
 * globally distributed, highly-durable enterprise event bus.
 */
class GooglePubSubService {
    constructor() {
        try {
            this.pubsub = new PubSub({ projectId: config.gcp.project_id });
            logger.info('📡 [PubSub] Google Cloud Pub/Sub Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [PubSub] Could not initialize PubSub Client.');
        }
    }

    /**
     * Publishes a telemetry event to a Pub/Sub topic globally.
     * @param {string} topicName - The target topic
     * @param {object} payload - The telemetry data
     */
    async publishEvent(topicName, payload) {
        logger.info(`📤 [PubSub] Publishing event to topic: ${topicName}...`);
        
        try {
            const dataBuffer = Buffer.from(JSON.stringify(payload));
            const messageId = await this.pubsub.topic(topicName).publishMessage({ data: dataBuffer });
            
            logger.info(`✅ [PubSub] Event published. Message ID: ${messageId}`);
            return messageId;
        } catch (error) {
            logger.error(`❌ [PubSub] Failed to publish event:`, error.message);
            // Fallback to local logger during development
            return null;
        }
    }

    /**
     * Subscribes a microservice to a global Pub/Sub topic.
     * @param {string} subscriptionName 
     * @param {function} messageHandler 
     */
    async subscribe(subscriptionName, messageHandler) {
        try {
            const subscription = this.pubsub.subscription(subscriptionName);
            subscription.on('message', message => {
                const parsedData = JSON.parse(message.data.toString());
                messageHandler(parsedData);
                message.ack();
            });
            
            subscription.on('error', error => {
                logger.error(`❌ [PubSub] Subscription Error:`, error.message);
            });
            
            logger.info(`📥 [PubSub] Subscribed to ${subscriptionName}`);
        } catch (error) {
            logger.error(`❌ [PubSub] Failed to attach subscription:`, error.message);
        }
    }
}

export const pubsubService = new GooglePubSubService();
