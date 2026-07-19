import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { logger } from '../../../shared/logger.js';

class AwsPubSubService {
  constructor() {
    this.sns = null;
    this.isInitialized = false;
    this._subscriptions = [];
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.AWS_REAL_SERVICES === 'true'
      ) {
        if (
          process.env.AWS_REGION &&
          (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ROLE_ARN)
        ) {
          this.sns = new SNSClient({ region: process.env.AWS_REGION });
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ AWS SNS initialization failed, falling back to local in-memory event bus: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Publish an event to AWS SNS topic
   */
  async publishEvent(topicName, message) {
    if (this.isInitialized && this.sns) {
      try {
        logger.info(
          `📡 AWS SNS: Publishing event to topic ${topicName}: ${JSON.stringify(message)}`,
        );
        const command = new PublishCommand({
          TopicArn: topicName, // In AWS this needs to be an ARN
          Message: JSON.stringify(message),
        });
        const response = await this.sns.send(command);
        return response.MessageId;
      } catch (e) {
        logger.error(
          `❌ AWS SNS publish failed: ${e.message}. Falling back to mock.`,
        );
      }
    }

    // Mock In-Memory Fallback
    logger.info(
      `📡 AWS SNS Mock: Publishing event to topic ${topicName}: ${JSON.stringify(message)}`,
    );
    if (this._subscriptions) {
      for (const sub of this._subscriptions) {
        if (sub.topicName === topicName) {
          setTimeout(() => sub.callback(message), 10);
        }
      }
    }
    return `aws-msg-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Subscribe to a topic (Mock implementation - AWS usually relies on SQS queues for consuming)
   */
  async subscribe(subName, topicName, callback) {
    if (this.isInitialized && this.sns) {
      logger.warn(
        `⚠️ AWS SQS consumption must be implemented for real subscription support. Using mock for ${subName}.`,
      );
    }
    // Mock In-Memory Fallback
    logger.info(
      `📡 AWS SNS Mock: Subscribing ${subName} to topic ${topicName}`,
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
      `📡 AWS SNS Mock: Subscribing to event topic ${topicName}`,
    );
    if (typeof callback === 'function') {
      this._subscriptions.push({ subName: 'default-sub', topicName, callback });
    }
  }
}

export const awsPubSubService = new AwsPubSubService();
export const pubsubService = awsPubSubService;
