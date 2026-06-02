import { ChromaClient } from 'chromadb';
/* DIRECT GEMINI BLOCKED - USE VERTEX VIA GATEWAY */
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import { AgentMemoryHooks } from './agentmemory.hooks.js';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
});

class MemoryPalaceService {
    constructor() {
        this.client = new ChromaClient({ path: process.env.CHROMA_DB_URL || "http://localhost:8000" });
        this.genAI = null /* DIRECT GEMINI BLOCKED */;
        this.collectionName = 'alti_episodic_memory';
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: this.collectionName,
                metadata: { "hnsw:space": "cosine" }
            });
            this.isInitialized = true;
            logger.info(`[Memory Palace] Successfully connected to ChromaDB collection: ${this.collectionName}`);
        } catch (error) {
            logger.error(`[Memory Palace] Initialization failed: ${error.message}`);
        }
    }

    async _getEmbedding(text) {
        try {
            if (!this.genAI.apiKey) return new Array(768).fill(0); // Fallback for tests
            const model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
            const result = await model.embedContent(text);
            return result.embedding.values;
        } catch (error) {
            logger.error(`[Memory Palace] Embedding failed: ${error.message}`);
            return new Array(768).fill(0); // Safest fallback
        }
    }

    /**
     * Save a completed sprint's root cause analysis, architecture, or outcome to permanent memory.
     * @param {Object} memoryPayload - The structured outcome of the sprint
     */
    async indexSprintMemory(memoryPayload) {
        await this.init();
        if (!this.collection) return null;

        try {
            const memoryString = JSON.stringify(memoryPayload);
            const embedding = await this._getEmbedding(memoryString);
            const docId = `sprint-${uuidv4()}`;

            await this.collection.add({
                ids: [docId],
                embeddings: [embedding],
                documents: [memoryString],
                metadatas: [{
                    type: memoryPayload.type || "sprint_outcome",
                    timestamp: Date.now()
                }]
            });

            logger.info(`[Memory Palace] Indexed episodic memory. ID: ${docId}`);

            // 🧠 AgentMemory Bridge: Also persist into AgentMemory for cross-system recall
            AgentMemoryHooks.captureToolUse(
                'memory_palace',
                `Indexed sprint memory: ${memoryPayload.type || 'sprint_outcome'}`,
                memoryString.substring(0, 2000),
                { docId, type: memoryPayload.type, bridge: 'memory_palace_to_agentmemory' }
            ).catch(() => {});

            return docId;
        } catch (error) {
            logger.error(`[Memory Palace] Failed to index memory: ${error.message}`);
            return null;
        }
    }

    /**
     * Semantically search the Memory Palace for previous relevant sprint context.
     * @param {string} query - The agent's pre-computation context query.
     * @param {number} topK - Number of results to retrieve.
     */
    async searchMemory(query, topK = 3) {
        await this.init();
        if (!this.collection) return [];

        try {
            const embedding = await this._getEmbedding(query);

            const results = await this.collection.query({
                queryEmbeddings: [embedding],
                nResults: topK,
            });

            if (!results || !results.documents || results.documents.length === 0) {
                return [];
            }

            // ChromaDB returns nested arrays for documents: [[doc1, doc2]]
            return results.documents[0].map(doc => JSON.parse(doc));
        } catch (error) {
            logger.error(`[Memory Palace] Search failed: ${error.message}`);
            return [];
        }
    }
}

export const memoryPalaceService = new MemoryPalaceService();
export default memoryPalaceService;
