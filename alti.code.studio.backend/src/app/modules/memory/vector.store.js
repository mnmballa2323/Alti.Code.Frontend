/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import pg from 'pg';
const { Pool } = pg;
import { vertexService } from '../ai/vertex.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';


class VectorStoreService {
    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres'
        });
        this.init();
    }

    async init() {
        try {
            await this.pool.query('CREATE EXTENSION IF NOT EXISTS vector');
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS alti_memory (
                    id text PRIMARY KEY,
                    embedding vector(768),
                    metadata jsonb,
                    document text
                )
            `);
            logger.info('🧠 VectorStore: AlloyDB/pgvector initialized.');
        } catch (error) {
            logger.error('❌ VectorStore init failed. Is PostgreSQL running?', error);
        }
    }

    /**
     * Add a document to memory
     * @param {string} text 
     * @param {object} metadata 
     */
    async add(text, metadata = {}) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('VectorStoreService: text must be a non-empty string.');
        }
        try {
            const embedding = await vertexService.getEmbeddings(text);
            // UUID prevents ID collision under concurrent add() calls
            const id = `doc_${crypto.randomUUID()}`;

            await this.pool.query(
                'INSERT INTO alti_memory (id, embedding, metadata, document) VALUES ($1, $2, $3, $4)',
                [id, JSON.stringify(embedding), metadata, text]
            );

            logger.info(`💾 Memory stored: ${id}`);
            return id;
        } catch (error) {
            logger.error('VectorStore: Failed to add document', error);
            throw error;
        }
    }


    /**
     * Search memory
     * @param {string} query 
     * @param {number} nResults 
     */
    async search(query, nResults = 3) {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new Error('VectorStoreService: query must be a non-empty string.');
        }
        try {
            const embedding = await vertexService.getEmbeddings(query);

            const { rows } = await this.pool.query(
                'SELECT id, metadata, document, (embedding <-> $1) as distance FROM alti_memory ORDER BY embedding <-> $1 LIMIT $2',
                [JSON.stringify(embedding), nResults]
            );

            return {
                documents: [rows.map(r => r.document)],
                metadatas: [rows.map(r => r.metadata)],
                ids: [rows.map(r => r.id)],
                distances: [rows.map(r => r.distance)]
            };
        } catch (error) {
            logger.error('VectorStore: Memory search failed', error);
            return { documents: [], metadatas: [], ids: [], distances: [] };
        }
    }

    /**
     * Fetch documents directly by ID.
     * @param {string[]} ids 
     */
    async getByIds(ids) {
        if (!ids || ids.length === 0) return [];
        try {
            const { rows } = await this.pool.query(
                'SELECT document FROM alti_memory WHERE id = ANY($1)',
                [ids]
            );
            return rows.map(r => r.document);
        } catch (error) {
            logger.error('VectorStore: getByIds failed', error);
            return [];
        }
    }

    /**
     * Delete all documents from the vector store.
     * Called by ragService.clearIndex() for full re-indexing or test teardown.
     */
    async reset() {
        try {
            await this.pool.query('DELETE FROM alti_memory');
            logger.info('🗑️ VectorStore: All documents deleted (reset).');
        } catch (error) {
            logger.error('VectorStore: reset() failed', error);
            throw error;
        }
    }

    /**
     * List recent memories linearly without vector search.
     * @param {number} limit 
     */
    async list(limit = 50) {
        try {
            const { rows } = await this.pool.query(
                'SELECT id, metadata, document FROM alti_memory ORDER BY id DESC LIMIT $1',
                [limit]
            );
            return rows;
        } catch (error) {
            logger.error('VectorStore: Memory list failed', error);
            return [];
        }
    }
}


export const vectorStoreService = new VectorStoreService();
