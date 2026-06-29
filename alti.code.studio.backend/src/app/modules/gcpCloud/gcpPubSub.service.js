import { PubSub } from '@google-cloud/pubsub';
import { logger } from '../../../shared/logger.js';

class GcpPubSubService {
  constructor() {
    this.pubsub = null;
    this.isInitialized = false;
    this._subscriptions = [];
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.GCP_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.GOOGLE_APPLICATION_CREDENTIALS ||
          process.env.GCP_PROJECT_ID
        ) {
          this.pubsub = new PubSub();
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Google Cloud Pub/Sub initialization failed, falling back to local in-memory event bus: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Publish an event to Google Cloud Pub/Sub topic
   */
  async publishEvent(topicName, message) {
    if (this.isInitialized && this.pubsub) {
      try {
        logger.info(
          `📡 Google Cloud Pub/Sub: Publishing event to topic ${topicName}: ${JSON.stringify(message)}`,
        );
        const dataBuffer = Buffer.from(JSON.stringify(message));
        const messageId = await this.pubsub
          .topic(topicName)
          .publishMessage({ data: dataBuffer });
        return messageId;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Pub/Sub publish failed: ${e.message}. Falling back to mock.`,
        );
      }
    }

    // Mock In-Memory Fallback
    logger.info(
      `📡 Google Cloud Pub/Sub Mock: Publishing event to topic ${topicName}: ${JSON.stringify(message)}`,
    );
    if (this._subscriptions) {
      for (const sub of this._subscriptions) {
        if (sub.topicName === topicName) {
          setTimeout(() => sub.callback(message), 10);
        }
      }
    }
    return `gcp-msg-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Subscribe to a topic
   */
  async subscribe(subName, topicName, callback) {
    if (this.isInitialized && this.pubsub) {
      try {
        logger.info(
          `📡 Google Cloud Pub/Sub: Subscribing subscription ${subName} to topic ${topicName}`,
        );
        const subscription = this.pubsub.subscription(subName);
        subscription.on('message', message => {
          logger.info(
            `📡 Google Cloud Pub/Sub: Received message on subscription ${subName}`,
          );
          try {
            const parsed = JSON.parse(message.data.toString());
            callback(parsed);
            message.ack();
          } catch (err) {
            logger.error(`Error parsing Pub/Sub message: ${err.message}`);
            message.nack();
          }
        });
        return;
      } catch (e) {
        logger.error(
          `❌ Google Cloud Pub/Sub subscription failed: ${e.message}. Falling back to mock.`,
        );
      }
    }

    // Mock In-Memory Fallback
    logger.info(
      `📡 Google Cloud Pub/Sub Mock: Subscribing ${subName} to topic ${topicName}`,
    );
    if (typeof callback === 'function') {
      this._subscriptions.push({ subName, topicName, callback });
    }
  }

  /**
   * Subscribe to a topic (alternative method signature)
   */
  async subscribeToEvent(topicName, callback) {
    logger.info(
      `📡 Google Cloud Pub/Sub Mock: Subscribing to event topic ${topicName}`,
    );
    if (typeof callback === 'function') {
      this._subscriptions.push({ subName: 'default-sub', topicName, callback });
    }
  }
}

export const gcpPubSubService = new GcpPubSubService();
export const pubsubService = gcpPubSubService;
export const azurePubSubService = gcpPubSubService;
