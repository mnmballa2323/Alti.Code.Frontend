/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * Gemini File Search Routes
 * Production-hardened endpoints with tiered rate limiting.
 *
 * Base path: /api/v1/file-search
 *
 * Rate Limit Tiers:
 *   - Reads (list, get):        60 req/min
 *   - Mutations (create, delete): 20 req/min
 *   - Uploads:                  10 req/min
 *   - Queries:                  30 req/min
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import express from 'express';
import { FileSearchController } from './fileSearch.controller.js';
import { RateLimitService } from '../security/rateLimit.service.js';

const router = express.Router();

// ─── Rate Limiters (tiered by operation cost) ─────
let readLimiter, mutateLimiter, uploadLimiter, queryLimiter;

try {
    readLimiter   = RateLimitService.middleware(60, 60);    // 60/min — cheap reads
    mutateLimiter = RateLimitService.middleware(20, 60);    // 20/min — state changes
    uploadLimiter = RateLimitService.middleware(10, 60);    // 10/min — heavy I/O
    queryLimiter  = RateLimitService.middleware(30, 60);    // 30/min — LLM calls
} catch {
    // RateLimitService may not be available in all environments
    const passthrough = (req, res, next) => next();
    readLimiter = mutateLimiter = uploadLimiter = queryLimiter = passthrough;
}

// ─── Store Management ────────────────────────
router.post('/stores',                          mutateLimiter, FileSearchController.createStore);
router.get('/stores',                           readLimiter,   FileSearchController.listStores);
router.get('/stores/:storeName',                readLimiter,   FileSearchController.getStore);
router.delete('/stores/:storeName',             mutateLimiter, FileSearchController.deleteStore);

// ─── File Upload & Import ────────────────────
router.post('/stores/:storeName/upload',        uploadLimiter, FileSearchController.uploadFile);
router.post('/stores/:storeName/import',        uploadLimiter, FileSearchController.importFile);

// ─── Document Management ─────────────────────
router.get('/stores/:storeName/documents',                   readLimiter,   FileSearchController.listDocuments);
router.get('/stores/:storeName/documents/:documentId',       readLimiter,   FileSearchController.getDocument);
router.delete('/stores/:storeName/documents/:documentId',    mutateLimiter, FileSearchController.deleteDocument);

// ─── RAG Query ───────────────────────────────
router.post('/query',                           queryLimiter, FileSearchController.queryStores);
router.post('/query/structured',                queryLimiter, FileSearchController.queryStructured);

export const fileSearchRoutes = router;
