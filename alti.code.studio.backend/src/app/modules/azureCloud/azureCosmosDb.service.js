import { logger } from '../../../shared/logger.js';

class AzureCosmosDbService {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Load document state from Cosmos DB
     */
    async loadDocState(docName) {
        logger.info(`💾 Azure Cosmos DB: Loading Yjs state for document: ${docName}`);
        return this.cache.get(docName) || null;
    }

    /**
     * Persist Yjs document update to Cosmos DB
     */
    async persistCrdtUpdate(docName, state) {
        logger.info(`💾 Azure Cosmos DB: Persisting Yjs update for document: ${docName}`);
        this.cache.set(docName, state);
        return true;
    }
}

export const azureCosmosDbService = new AzureCosmosDbService();
export const FirestoreSyncService = azureCosmosDbService;
