/**
 * Copyright (c) 2026 Inso Code
 *
 * pglite.test.js — Integration tests for PGLite WASM database and LlamaIndex imports.
 */

import '../../polyfill.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { pgliteRoutes } from '../../src/app/modules/pglite/pglite.route.js';
import { llamaindexRoutes } from '../../src/app/modules/llamaindex/llamaindex.route.js';
import { pgLiteService } from '../../src/app/services/pglite.service.js';

describe('PGLite WASM Database & LlamaIndex Integration Tests', () => {
  let app;
  let server;
  let port;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/pglite', pgliteRoutes);
    app.use('/api/v1/llamaindex', llamaindexRoutes);

    server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    port = server.address().port;
  });

  afterAll(async () => {
    server.close();
    await pgLiteService.shutdown();
  });

  describe('LlamaIndex Imports Verification', () => {
    it('should successfully load llamaindex routes and indexer without throwing syntax or import errors', () => {
      expect(llamaindexRoutes).toBeDefined();
      expect(typeof llamaindexRoutes).toBe('function'); // Express router is a function
    });
  });

  describe('PGLite In-Memory DB Sandbox', () => {
    it('should initialize and execute SQL queries via query endpoint', async () => {
      // 1. Create a test table
      const createResponse = await fetch(`http://localhost:${port}/api/v1/pglite/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'CREATE TABLE test_sandbox (id SERIAL PRIMARY KEY, info TEXT);'
        })
      });
      expect(createResponse.status).toBe(200);
      const createData = await createResponse.json();
      expect(createData.success).toBe(true);

      // 2. Insert test data
      const insertResponse = await fetch(`http://localhost:${port}/api/v1/pglite/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'INSERT INTO test_sandbox (info) VALUES ($1), ($2) RETURNING *;',
          params: ['Hello WASM PostgreSQL', 'Trending MIT Frameworks']
        })
      });
      expect(insertResponse.status).toBe(200);
      const insertData = await insertResponse.json();
      expect(insertData.success).toBe(true);
      expect(insertData.rows).toHaveLength(2);
      expect(insertData.rows[0].info).toBe('Hello WASM PostgreSQL');

      // 3. Select data
      const selectResponse = await fetch(`http://localhost:${port}/api/v1/pglite/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT * FROM test_sandbox ORDER BY id ASC;'
        })
      });
      expect(selectResponse.status).toBe(200);
      const selectData = await selectResponse.json();
      expect(selectData.success).toBe(true);
      expect(selectData.rows).toHaveLength(2);
      expect(selectData.rows[1].info).toBe('Trending MIT Frameworks');
    });

    it('should securely handle query syntax errors', async () => {
      const response = await fetch(`http://localhost:${port}/api/v1/pglite/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT * FROM non_existent_table;'
        })
      });
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should support resetting/shutting down database instances', async () => {
      const response = await fetch(`http://localhost:${port}/api/v1/pglite/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: 'default' })
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('reset successfully');

      // Querying again should re-initialize the database schema
      const checkResponse = await fetch(`http://localhost:${port}/api/v1/pglite/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT * FROM sandbox_users;'
        })
      });
      expect(checkResponse.status).toBe(200);
      const checkData = await checkResponse.json();
      expect(checkData.success).toBe(true);
      expect(checkData.rows).toHaveLength(0);
    });
  });
});
