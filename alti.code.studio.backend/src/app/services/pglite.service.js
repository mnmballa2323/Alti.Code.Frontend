/**
 * Copyright (c) 2026 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { PGlite } from '@electric-sql/pglite';
import { logger } from '../../shared/logger.js';

class PGLiteService {
  constructor() {
    this.instances = new Map();
    this.defaultDb = null;
  }

  /**
   * Get or create a PGLite instance.
   * If tenantId is omitted, returns the default global in-memory instance.
   * @param {string} [tenantId] 
   * @returns {Promise<PGlite>}
   */
  async getInstance(tenantId = 'default') {
    if (tenantId === 'default') {
      if (!this.defaultDb) {
        logger.info('⚡ Initializing default in-memory PGLite WASM database...');
        this.defaultDb = new PGlite();
        // Run some basic schema initialization for sandbox environment
        await this.defaultDb.query(`
          CREATE TABLE IF NOT EXISTS sandbox_users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        logger.info('✅ Default PGLite instance initialized with user sandbox schema.');
      }
      return this.defaultDb;
    }

    if (!this.instances.has(tenantId)) {
      logger.info(`⚡ Initializing isolated PGLite WASM instance for tenant: ${tenantId}...`);
      const instance = new PGlite();
      this.instances.set(tenantId, instance);
      logger.info(`✅ Isolated PGLite instance created for tenant: ${tenantId}`);
    }

    return this.instances.get(tenantId);
  }

  /**
   * Execute a query against a PGLite instance.
   * @param {string} sql 
   * @param {Array} [params] 
   * @param {string} [tenantId] 
   */
  async query(sql, params = [], tenantId = 'default') {
    const db = await this.getInstance(tenantId);
    try {
      logger.info(`💾 PGLite [${tenantId}] executing query: ${sql.substring(0, 120)}`);
      const result = await db.query(sql, params);
      return result;
    } catch (err) {
      logger.error(`❌ PGLite query error: ${err.message}`, err);
      throw err;
    }
  }

  /**
   * Close a specific instance or all instances.
   * @param {string} [tenantId] 
   */
  async shutdown(tenantId) {
    if (tenantId) {
      const db = this.instances.get(tenantId);
      if (db) {
        await db.close();
        this.instances.delete(tenantId);
        logger.info(`Closed PGLite instance for tenant: ${tenantId}`);
      }
    } else {
      if (this.defaultDb) {
        await this.defaultDb.close();
        this.defaultDb = null;
      }
      for (const [id, db] of this.instances.entries()) {
        await db.close();
      }
      this.instances.clear();
      logger.info('All PGLite instances shut down.');
    }
  }
}

export const pgLiteService = new PGLiteService();
