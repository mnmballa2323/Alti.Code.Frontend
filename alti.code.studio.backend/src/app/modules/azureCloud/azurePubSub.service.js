import { ServiceBusClient } from '@azure/service-bus';
import { logger } from '../../../shared/logger.js';

class AzurePubSubService {
  constructor() {
    this.sbClient = null;
    this.isInitialized = false;
    this._subscriptions = [];
    this.init();
  }

  init() {
    try {
      if (
        process.env.NODE_ENV !== 'test' ||
        process.env.AZURE_REAL_SERVICES === 'true'
      ) {
        if (process.env.AZURE_SERVICEBUS_CONNECTION_STRING) {
          this.sbClient = new ServiceBusClient(process.env.AZURE_SERVICEBUS_CONNECTION_STRING);
          this.isInitialized = true;
        }
      }
    } catch (e) {
      logger.warn(
        `⚠️ Azure Service Bus initialization failed, falling back to local in-memory event bus: ${e.message}`,
      );
      this.isInitialized = false;
    }
  }

  /**
   * Publish an event to Azure Service Bus topic
   */
  async publishEvent(topicName, message) {
    if (this.isInitialized && this.sbClient) {
      try {
        logger.info(
          `📡 Azure Service Bus: Publishing event to topic ${topicName}: ${JSON.stringify(message)}`,
        );
        const sender = this.sbClient.createSender(topicName);
        
        await sender.sendMessages({
          body: message
        });
        
        await sender.close();
        return `azure-msg-${Math.random().toString(36).substring(7)}`;
      } catch (e) {
        logger.error(
          `❌ Azure Service Bus publish failed: ${e.message}. Falling back to mock.`,
        );
      }
    }

    // Mock In-Memory Fallback
    logger.info(
      `📡 Azure Service Bus Mock: Publishing event to topic ${topicName}: ${JSON.stringify(message)}`,
    );
    if (this._subscriptions) {
      for (const sub of this._subscriptions) {
        if (sub.topicName === topicName) {
          setTimeout(() => sub.callback(message), 10);
        }
      }
    }
    return `azure-mock-msg-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Subscribe to a topic (Mock implementation)
   */
  async subscribe(subName, topicName, callback) {
    if (this.isInitialized && this.sbClient) {
      try {
        logger.info(
          `📡 Azure Service Bus: Subscribing subscription ${subName} to topic ${topicName}`,
        );
        const receiver = this.sbClient.createReceiver(topicName, subName);
        receiver.subscribe({
          processMessage: async (message) => {
            logger.info(`📡 Azure Service Bus: Received message on subscription ${subName}`);
            try {
              callback(message.body);
            } catch (err) {
              logger.error(`Error parsing Service Bus message: ${err.message}`);
            }
          },
          processError: async (args) => {
            logger.error(`Error from Service Bus receiver: ${args.error}`);
          }
        });
        return;
      } catch (e) {
        logger.error(
          `❌ Azure Service Bus subscription failed: ${e.message}. Falling back to mock.`,
        );
      }
    }
    // Mock In-Memory Fallback
    logger.info(
      `📡 Azure Service Bus Mock: Subscribing ${subName} to topic ${topicName}`,
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
      `📡 Azure Service Bus Mock: Subscribing to event topic ${topicName}`,
    );
    if (typeof callback === 'function') {
      this._subscriptions.push({ subName: 'default-sub', topicName, callback });
    }
  }
}

export const azurePubSubService = new AzurePubSubService();
export const pubsubService = azurePubSubService;
