import {
    Document,
    VectorStoreIndex,
    storageContextFromDefaults,
    ContextChatEngine,
    Settings
} from 'llamaindex';
import { OpenAIEmbedding } from '@llamaindex/openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../../shared/logger.js';
import config from '../../../config/index.js';

class GeminiEmbedding {
    constructor(init) {
        this.genAI = new GoogleGenerativeAI(init.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    }

    async getTextEmbedding(text) {
        const result = await this.model.embedContent(text);
        return result.embedding.values;
    }

    async getQueryEmbedding(query) {
        const result = await this.model.embedContent(query);
        return result.embedding.values;
    }
}

class MockEmbedding {
    async getTextEmbedding(text) {
        // Return constant vector of dimension 1536 (OpenAI default)
        return new Array(1536).fill(0.1);
    }
    async getQueryEmbedding(query) {
        return new Array(1536).fill(0.1);
    }
}

// Configure Settings global
if (config.openai_secret_key && config.openai_secret_key !== 'sk-placeholder') {
    Settings.embedModel = new OpenAIEmbedding({ apiKey: config.openai_secret_key });
} else if (config.gemini_secret_key) {
    logger.info('🧠 Using Gemini Embeddings for Vector Memory');
    Settings.embedModel = new GeminiEmbedding({ apiKey: config.gemini_secret_key });
} else {
    logger.warn('⚠️ No Valid API Key found. Vector Memory operating in MOCK mode.');
}

class AntigravityMemory {
    constructor() {
        this.index = null;
        this.storageContext = null;
        this.persistDir = path.join(process.cwd(), 'storage', 'vector_store');
        this.isInitialized = false;
        this.isMock = (!config.openai_secret_key || config.openai_secret_key === 'sk-placeholder') && !config.gemini_secret_key;
    }

    async init() {
        if (this.isInitialized) return;

        if (this.isMock) {
            this.isInitialized = true;
            logger.info('🧠 Vector Memory Initialized (MOCK MODE)');
            return;
        }

        try {
            // Ensure storage directory exists
            await fs.mkdir(this.persistDir, { recursive: true });

            const storageExists = await this.checkStorageExists();

            if (storageExists) {
                logger.info('🧠 Loading Vector Memory from disk...');
                this.storageContext = await storageContextFromDefaults({ persistDir: this.persistDir });
                // Load index from storage (LlamaIndex v0.x specific, might need adjustment based on exact version)
                // In 0.12.x: VectorStoreIndex.init({ storageContext })
                this.index = await VectorStoreIndex.init({ storageContext: this.storageContext });
            } else {
                logger.info('🧠 Creating new Vector Memory...');
                this.storageContext = await storageContextFromDefaults({ persistDir: this.persistDir });
                this.index = await VectorStoreIndex.fromDocuments([], { storageContext: this.storageContext });
                // await this.storageContext.persist(); // Not needed or invalid in this version
            }

            this.isInitialized = true;
            logger.info('🧠 Vector Memory Initialized');
        } catch (error) {
            logger.error('Failed to initialize Vector Memory', error);
        }
    }

    async checkStorageExists() {
        try {
            await fs.access(path.join(this.persistDir, 'doc_store.json'));
            return true;
        } catch {
            return false;
        }
    }

    async add(text, metadata = {}) {
        if (!this.isInitialized) await this.init();

        if (this.isMock) {
            logger.info('🧠 Memory Added (MOCK)');
            return;
        }

        try {
            const doc = new Document({ text, metadata });
            await this.index.insert(doc);
            // await this.storageContext.persist(); // Auto-save
            logger.info('🧠 Memory Added');
        } catch (error) {
            logger.error('Failed to add to memory', error);
        }
    }

    async query(text) {
        if (!this.isInitialized) await this.init();

        if (this.isMock) {
            return [];
        }

        try {
            const retriever = this.index.asRetriever();
            const nodes = await retriever.retrieve(text);
            return nodes.map(n => ({ text: n.node.text, score: n.score, metadata: n.node.metadata }));
        } catch (error) {
            logger.error('Failed to query memory', error);
            return [];
        }
    }
}

export const VectorMemory = new AntigravityMemory();
