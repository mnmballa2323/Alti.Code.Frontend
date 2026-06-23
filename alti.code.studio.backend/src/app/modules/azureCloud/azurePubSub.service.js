import { logger } from '../../../shared/logger.js';

class AzurePubSubService {
    constructor() {
        this._subscriptions = [];
    }

    /**
     * Publish an event to Azure Service Bus / Event Grid topic
     * @param {string} topicName 
     * @param {object} message 
     */
    async publishEvent(topicName, message) {
        logger.info(`📡 Azure Event Hub/Service Bus: Published to ${topicName}: ${JSON.stringify(message)}`);
        
        // Trigger matching subscribers asynchronously
        if (this._subscriptions) {
            for (const sub of this._subscriptions) {
                if (sub.topicName === topicName) {
                    setTimeout(() => sub.callback(message), 10);
                }
            }
        }
        return `az-msg-${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Subscribe to a topic (Backward compatible helper)
     */
    async subscribe(subName, topicName, callback) {
        logger.info(`📡 Azure Event Hub/Service Bus: Subscribed ${subName} to topic ${topicName}`);
        if (typeof callback === 'function') {
            this._subscriptions.push({ subName, topicName, callback });
        }
    }

    /**
     * Subscribe to a topic
     * @param {string} topicName 
     * @param {Function} callback 
     */
    async subscribeToEvent(topicName, callback) {
        logger.info(`📡 Azure Event Hub/Service Bus: Subscribed to ${topicName}`);
        if (typeof callback === 'function') {
            this._subscriptions.push({ subName: 'default-sub', topicName, callback });
        }
    }
}

export const azurePubSubService = new AzurePubSubService();
export const pubsubService = azurePubSubService;
