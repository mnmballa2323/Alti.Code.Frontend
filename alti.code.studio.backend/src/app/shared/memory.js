/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../shared/logger.js';
import { postgresClient } from './postgres.client.js';
import { GeminiAiService } from '../modules/gemini/gemini.service.js';

/** Maximum number of entries kept in the embedding cache. */
const CACHE_MAX_SIZE = 256;

/**
 * Simple LRU-style bounded Map cache for embedding vectors.
 * When the map exceeds CACHE_MAX_SIZE, the oldest inserted key is evicted.
 */
class EmbeddingCache {
  constructor(maxSize = CACHE_MAX_SIZE) {
    this._store = new Map();
    this._maxSize = maxSize;
  }

  get(text) {
    return this._store.get(text) ?? null;
  }

  set(text, embedding) {
    if (this._store.size >= this._maxSize) {
      // Evict the oldest key (Maps preserve insertion order)
      this._store.delete(this._store.keys().next().value);
    }
    this._store.set(text, embedding);
  }

  get size() {
    return this._store.size;
  }
}

const embeddingCache = new EmbeddingCache();

class AntigravityMemory {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    await postgresClient.init();
    logger.info('🧠 Memory initialized using Gemini AI');
    this.isInitialized = true;
  }

  /**
   * Returns the embedding for `text`, using the in-process cache to avoid
   * redundant API calls for identical inputs.
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async getEmbedding(text) {
    const cached = embeddingCache.get(text);
    if (cached) {
      logger.debug(
        `🧠 Memory: Embedding cache HIT (cache size: ${embeddingCache.size})`,
      );
      return cached;
    }

    const embedding = await GeminiAiService.getEmbeddings(text);
    embeddingCache.set(text, embedding);
    logger.debug(
      `🧠 Memory: Embedding cache MISS — stored (cache size: ${embeddingCache.size})`,
    );
    return embedding;
  }

  async add(content, metadata = {}) {
    if (!this.isInitialized) await this.init();

    try {
      const embedding = await this.getEmbedding(content);
      const id = await postgresClient.insertMemory(
        content,
        metadata,
        embedding,
      );
      return id ?? null;
    } catch (error) {
      logger.error('Failed to add memory', error);
    }
    return null;
  }

  async search(query, limit = 5) {
    if (!this.isInitialized) await this.init();

    try {
      const embedding = await this.getEmbedding(query);
      return await postgresClient.searchMemories(embedding, limit);
    } catch (error) {
      logger.error('Failed to search memory', error);
      return [];
    }
  }

  /**
   * Deletes a single memory entry by its database ID.
   *
   * @param {string|number} id
   * @returns {Promise<boolean>} true if deleted, false on error
   */
  async delete(id) {
    if (!this.isInitialized) await this.init();
    try {
      await postgresClient.deleteMemory(id);
      logger.info(`🧠 Memory: Deleted entry id=${id}`);
      return true;
    } catch (error) {
      logger.error(`Memory: Failed to delete id=${id}`, error);
      return false;
    }
  }

  /**
   * Updates an existing memory entry with new content and metadata.
   * Re-embeds the new content before upserting.
   *
   * @param {string|number} id
   * @param {string} content
   * @param {object} [metadata={}]
   * @returns {Promise<boolean>}
   */
  async update(id, content, metadata = {}) {
    if (!this.isInitialized) await this.init();
    try {
      const embedding = await this.getEmbedding(content);
      await postgresClient.updateMemory(id, content, metadata, embedding);
      logger.info(`🧠 Memory: Updated entry id=${id}`);
      return true;
    } catch (error) {
      logger.error(`Memory: Failed to update id=${id}`, error);
      return false;
    }
  }

  /**
   * Clears ALL memory entries.
   * Should be guarded by admin authorization at the route level.
   *
   * @param {boolean} [confirm=false] — Must be true to execute (prevents accidents)
   * @returns {Promise<boolean>}
   */
  async clear(confirm = false) {
    if (!confirm) {
      logger.warn('🧠 Memory: clear() called without confirm=true. Aborted.');
      return false;
    }
    if (!this.isInitialized) await this.init();
    try {
      await postgresClient.clearAllMemories();
      embeddingCache._store.clear();
      logger.warn('🧠 Memory: ALL entries cleared.');
      return true;
    } catch (error) {
      logger.error('Memory: Failed to clear all entries', error);
      return false;
    }
  }

  /**
   * Returns observability stats for the in-process embedding cache.
   * Useful for the /api/v1/health endpoint.
   *
   * @returns {{ size: number, maxSize: number, utilizationPct: number }}
   */
  embeddingCacheStats() {
    return {
      size: embeddingCache.size,
      maxSize: CACHE_MAX_SIZE,
      utilizationPct: +((embeddingCache.size / CACHE_MAX_SIZE) * 100).toFixed(
        1,
      ),
    };
  }
}

export const VectorMemory = new AntigravityMemory();
