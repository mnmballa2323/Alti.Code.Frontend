/**
 * Copyright (c) 2024 Inso Code
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
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/postgres',
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
      await this.pool.query(`
                ALTER TABLE alti_memory ADD COLUMN IF NOT EXISTS tenant_id varchar;
            `);
      await this.pool.query(`
                CREATE INDEX IF NOT EXISTS alti_memory_tenant_id_idx ON alti_memory (tenant_id);
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
   * @param {string} tenantId
   */
  async add(text, metadata = {}, tenantId) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('VectorStoreService: text must be a non-empty string.');
    }
    if (
      !tenantId ||
      typeof tenantId !== 'string' ||
      tenantId.trim().length === 0
    ) {
      throw new Error(
        'VectorStoreService: tenantId is required and must be a non-empty string.',
      );
    }
    try {
      const embedding = await vertexService.getEmbeddings(text);
      // UUID prevents ID collision under concurrent add() calls
      const id = `doc_${crypto.randomUUID()}`;

      await this.pool.query(
        'INSERT INTO alti_memory (id, embedding, metadata, document, tenant_id) VALUES ($1, $2, $3, $4, $5)',
        [id, JSON.stringify(embedding), metadata, text, tenantId],
      );

      logger.info(`💾 Memory stored: ${id} (Tenant: ${tenantId})`);
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
   * @param {string} tenantId
   */
  async search(query, nResults = 3, tenantId) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new Error('VectorStoreService: query must be a non-empty string.');
    }
    if (
      !tenantId ||
      typeof tenantId !== 'string' ||
      tenantId.trim().length === 0
    ) {
      logger.warn(
        'VectorStore: search failed because tenantId is omitted or invalid.',
      );
      return { documents: [], metadatas: [], ids: [], distances: [] };
    }
    try {
      const embedding = await vertexService.getEmbeddings(query);

      const { rows } = await this.pool.query(
        'SELECT id, metadata, document, (embedding <-> $1) as distance FROM alti_memory WHERE tenant_id = $2 ORDER BY embedding <-> $1 LIMIT $3',
        [JSON.stringify(embedding), tenantId, nResults],
      );

      return {
        documents: [rows.map(r => r.document)],
        metadatas: [rows.map(r => r.metadata)],
        ids: [rows.map(r => r.id)],
        distances: [rows.map(r => r.distance)],
      };
    } catch (error) {
      logger.error('VectorStore: Memory search failed', error);
      return { documents: [], metadatas: [], ids: [], distances: [] };
    }
  }

  /**
   * Fetch documents directly by ID.
   * @param {string[]} ids
   * @param {string} tenantId
   */
  async getByIds(ids, tenantId) {
    if (!ids || ids.length === 0) return [];
    if (
      !tenantId ||
      typeof tenantId !== 'string' ||
      tenantId.trim().length === 0
    ) {
      logger.warn(
        'VectorStore: getByIds failed because tenantId is omitted or invalid.',
      );
      return [];
    }
    try {
      const { rows } = await this.pool.query(
        'SELECT document FROM alti_memory WHERE id = ANY($1) AND tenant_id = $2',
        [ids, tenantId],
      );
      return rows.map(r => r.document);
    } catch (error) {
      logger.error('VectorStore: getByIds failed', error);
      return [];
    }
  }

  /**
   * Delete documents from the vector store.
   * @param {string} [tenantId]
   */
  async reset(tenantId) {
    try {
      if (tenantId) {
        await this.pool.query('DELETE FROM alti_memory WHERE tenant_id = $1', [
          tenantId,
        ]);
        logger.info(
          `🗑️ VectorStore: All documents deleted for tenant ${tenantId} (reset).`,
        );
      } else {
        await this.pool.query('DELETE FROM alti_memory');
        logger.info('🗑️ VectorStore: All documents deleted (reset).');
      }
    } catch (error) {
      logger.error('VectorStore: reset() failed', error);
      throw error;
    }
  }

  /**
   * List recent memories linearly without vector search.
   * @param {number} limit
   * @param {string} tenantId
   */
  async list(limit = 50, tenantId) {
    if (
      !tenantId ||
      typeof tenantId !== 'string' ||
      tenantId.trim().length === 0
    ) {
      logger.warn(
        'VectorStore: list failed because tenantId is omitted or invalid.',
      );
      return [];
    }
    try {
      const { rows } = await this.pool.query(
        'SELECT id, metadata, document FROM alti_memory WHERE tenant_id = $2 ORDER BY id DESC LIMIT $1',
        [limit, tenantId],
      );
      return rows;
    } catch (error) {
      logger.error('VectorStore: Memory list failed', error);
      return [];
    }
  }
}

export const vectorStoreService = new VectorStoreService();
