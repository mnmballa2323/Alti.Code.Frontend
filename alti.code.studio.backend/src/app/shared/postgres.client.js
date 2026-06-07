/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import pg from 'pg';
import pgvector from 'pgvector/pg';
import { logger } from '../../shared/logger.js';

const { Pool } = pg;

class PostgresClient {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async init() {
        if (this.isConnected) return;

        const config = {
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD || 'postgres',
            host: process.env.POSTGRES_HOST || 'localhost',
            database: process.env.POSTGRES_DB || 'alti_db',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
        };

        try {
            this.pool = new Pool(config);

            // Register pgvector type
            await pgvector.registerType(this.pool);

            // Test connection
            await this.pool.query('SELECT NOW()');
            this.isConnected = true;
            logger.info('🐘 Connected to PostgreSQL');

            // Initialize Schema
            await this.initSchema();

        } catch (error) {
            logger.warn('🐘 Failed to connect to PostgreSQL. Falling back to In-Memory mode.', error.message);
            this.isConnected = false;
        }
    }

    async initSchema() {
        if (!this.isConnected) return;

        try {
            await this.pool.query('CREATE EXTENSION IF NOT EXISTS vector');
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS memories (
                    id SERIAL PRIMARY KEY,
                    content TEXT,
                    metadata JSONB,
                    embedding vector(768),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            // Index for faster search
            // await this.pool.query('CREATE INDEX IF NOT EXISTS memory_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)');
        } catch (error) {
            logger.error('🐘 Schema init failed', error);
        }
    }

    async insertMemory(content, metadata, embedding) {
        if (!this.isConnected) return null;

        try {
            const query = `
                INSERT INTO memories (content, metadata, embedding)
                VALUES ($1, $2, $3)
                RETURNING id
            `;
            const res = await this.pool.query(query, [content, metadata, pgvector.toSql(embedding)]);
            return res.rows[0].id;
        } catch (error) {
            logger.error('🐘 Insert failed', error);
            return null;
        }
    }

    async searchMemories(embedding, limit = 5) {
        if (!this.isConnected) return [];

        try {
            const query = `
                SELECT id, content, metadata, 1 - (embedding <=> $1) AS similarity
                FROM memories
                ORDER BY embedding <=> $1
                LIMIT $2
            `;
            const res = await this.pool.query(query, [pgvector.toSql(embedding), limit]);
            return res.rows;
        } catch (error) {
            logger.error('🐘 Search failed', error);
            return [];
        }
    }

    async close() {
        if (this.pool) await this.pool.end();
    }

    /**
     * Delete a single memory entry by its numeric ID.
     * @param {number} id
     * @returns {Promise<void>}
     */
    async deleteMemory(id) {
        if (!this.isConnected) return;
        try {
            await this.pool.query('DELETE FROM memories WHERE id = $1', [id]);
        } catch (error) {
            logger.error(`🐘 deleteMemory(${id}) failed`, error);
            throw error;
        }
    }

    /**
     * Update an existing memory entry with new content, metadata, and a
     * freshly computed embedding vector.
     *
     * @param {number} id
     * @param {string} content
     * @param {object} metadata
     * @param {number[]} embedding
     * @returns {Promise<void>}
     */
    async updateMemory(id, content, metadata, embedding) {
        if (!this.isConnected) return;
        try {
            await this.pool.query(
                `UPDATE memories
                 SET content = $1, metadata = $2, embedding = $3
                 WHERE id = $4`,
                [content, metadata, pgvector.toSql(embedding), id]
            );
        } catch (error) {
            logger.error(`🐘 updateMemory(${id}) failed`, error);
            throw error;
        }
    }

    /**
     * Delete ALL memory entries.
     * Guarded by AntigravityMemory.clear(confirm=true) at the service layer.
     * @returns {Promise<void>}
     */
    async clearAllMemories() {
        if (!this.isConnected) return;
        try {
            await this.pool.query('TRUNCATE TABLE memories RESTART IDENTITY');
            logger.warn('🐘 clearAllMemories: memories table truncated.');
        } catch (error) {
            logger.error('🐘 clearAllMemories failed', error);
            throw error;
        }
    }
}

export const postgresClient = new PostgresClient();
