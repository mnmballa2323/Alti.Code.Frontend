/**
 * Copyright (c) 2026 Inso Code
 *
 * astGrep.test.js — Integration tests for @ast-grep/napi and Recast code intelligence tools.
 */

import '../../polyfill.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { astGrepRoutes } from '../../src/app/modules/astGrep/astGrep.route.js';
import { astGrepService } from '../../src/app/services/astGrep.service.js';
import { recastService } from '../../src/app/services/recast.service.js';

describe('ast-grep & Recast Code Intelligence Integration Tests', () => {
  let app;
  let server;
  let port;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/astGrep', astGrepRoutes);

    server = await new Promise((resolve) => {
      const s = app.listen(0, () => resolve(s));
    });
    port = server.address().port;
  });

  afterAll(() => {
    server.close();
  });

  describe('ast-grep Wrapper Operations', () => {
    const testCode = `
      function multiply(x, y) {
        console.log("Multiplying inputs...");
        return x * y;
      }
    `;

    it('should dynamically find structural patterns using ast-grep', async () => {
      const response = await fetch(`http://localhost:${port}/api/v1/astGrep/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: 'javascript',
          source: testCode,
          pattern: 'console.log($MSG)'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.count).toBe(1);
      expect(data.matches[0].text).toBe('console.log("Multiplying inputs...")');
    });

    it('should structurally replace matching patterns', async () => {
      const response = await fetch(`http://localhost:${port}/api/v1/astGrep/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: 'javascript',
          source: testCode,
          pattern: 'console.log($MSG)',
          rewritePattern: 'logger.info($MSG)'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.code).toContain('logger.info("Multiplying inputs...")');
      expect(data.code).not.toContain('console.log');
    });
  });

  describe('Recast Style-Preserving Transforms', () => {
    const styledCode = `
      // This is a custom spacing test
      function calculateArea(r) {
        
        /* Inner Comment */
        const pi   =   3.14159;
        
        return pi * r * r;
      }
    `;

    it('should transform AST while preserving format, spacing, and comments', async () => {
      const response = await fetch(`http://localhost:${port}/api/v1/astGrep/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'recast-rename',
          source: styledCode,
          oldName: 'calculateArea',
          newName: 'getCircleArea'
        })
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.code).toContain('function getCircleArea(r)');
      expect(data.code).toContain('const pi   =   3.14159;'); // Spacing preserved!
      expect(data.code).toContain('/* Inner Comment */'); // Comment preserved!
      expect(data.code).toContain('// This is a custom spacing test');
    });
  });
});
