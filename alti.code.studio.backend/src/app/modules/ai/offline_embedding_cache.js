import axios from 'axios';
import crypto from 'crypto';
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { logger } from '../../../shared/logger.js';

// Schema Definition
const OfflineEmbeddingSchema = new mongoose.Schema({
    textHash: { type: String, required: true, unique: true, index: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    model: { type: String, required: true }
}, { timestamps: true });

let OfflineEmbeddingModel;
try {
    OfflineEmbeddingModel = mongoose.models.OfflineEmbedding || mongoose.model('OfflineEmbedding', OfflineEmbeddingSchema);
} catch (e) {
    logger.warn(`⚠️ [OfflineEmbeddingCache] Mongoose model initialization failed: ${e.message}`);
}

const FILE_CACHE_PATH = path.resolve('logs/offline_embeddings_cache.json');

export class OfflineEmbeddingCache {
    static _hashText(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    static async getEmbedding(text, options = {}) {
        if (!text || typeof text !== 'string') {
            throw new Error('Input text must be a non-empty string');
        }

        const textHash = this._hashText(text);
        const model = process.env.AIR_GAPPED_EMBEDDING_MODEL || 'nomic-embed-text';
        const url = process.env.OLLAMA_EMBED_URL || process.env.OLLAMA_API_URL?.replace('/generate', '/embeddings') || 'http://localhost:11434/api/embeddings';

        // 1. Try DB Cache first (if MongoDB is connected)
        if (mongoose.connection && mongoose.connection.readyState === 1 && OfflineEmbeddingModel) {
            try {
                const cached = await OfflineEmbeddingModel.findOne({ textHash, model });
                if (cached) {
                    logger.info(`✨ [OfflineEmbeddingCache] Cache HIT (DB) for hash: ${textHash}`);
                    return cached.embedding;
                }
            } catch (err) {
                logger.warn(`⚠️ [OfflineEmbeddingCache] DB cache read error: ${err.message}`);
            }
        }

        // 2. Try JSON File Cache
        let fileCache = {};
        try {
            if (fs.existsSync(FILE_CACHE_PATH)) {
                const raw = fs.readFileSync(FILE_CACHE_PATH, 'utf8');
                fileCache = JSON.parse(raw);
                if (fileCache[textHash] && fileCache[textHash].model === model) {
                    logger.info(`✨ [OfflineEmbeddingCache] Cache HIT (JSON File) for hash: ${textHash}`);
                    return fileCache[textHash].embedding;
                }
            }
        } catch (err) {
            logger.warn(`⚠️ [OfflineEmbeddingCache] File cache read error: ${err.message}`);
        }

        // 3. Cache Miss: Query local Ollama API
        logger.info(`🔌 [OfflineEmbeddingCache] Cache MISS. Fetching embedding from Ollama for model: ${model}`);
        let embedding;
        try {
            const response = await axios.post(url, {
                model,
                prompt: text
            }, { timeout: 15000 });

            if (response.data && response.data.embedding) {
                embedding = response.data.embedding;
            } else if (response.data && response.data.embeddings) {
                // Handle different array format if returned by some providers
                embedding = response.data.embeddings[0];
            }

            if (!embedding || !Array.isArray(embedding)) {
                throw new Error('Malformed embedding response from Ollama');
            }
        } catch (err) {
            logger.error(`❌ [OfflineEmbeddingCache] Failed to fetch embedding: ${err.message}`);
            throw err;
        }

        // 4. Save to Cache
        // Save to DB (if connected)
        if (mongoose.connection && mongoose.connection.readyState === 1 && OfflineEmbeddingModel) {
            try {
                await OfflineEmbeddingModel.updateOne(
                    { textHash, model },
                    { text, embedding },
                    { upsert: true }
                );
                logger.info(`💾 [OfflineEmbeddingCache] Saved embedding to DB for hash: ${textHash}`);
            } catch (err) {
                logger.warn(`⚠️ [OfflineEmbeddingCache] Failed to save to DB: ${err.message}`);
            }
        }

        // Save to JSON File
        try {
            const dir = path.dirname(FILE_CACHE_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fileCache[textHash] = {
                text,
                embedding,
                model,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(FILE_CACHE_PATH, JSON.stringify(fileCache, null, 2), 'utf8');
            logger.info(`💾 [OfflineEmbeddingCache] Saved embedding to JSON File for hash: ${textHash}`);
        } catch (err) {
            logger.warn(`⚠️ [OfflineEmbeddingCache] Failed to save to JSON File: ${err.message}`);
        }

        return embedding;
    }
}
