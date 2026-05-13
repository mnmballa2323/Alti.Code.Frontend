/**
 * QA Controller — REST API for QAService v2
 *
 * Routes (all mounted at /api/v1/qa):
 *   POST /spec          → generateSpec(sourceFile)
 *   POST /suite         → generateSuite(moduleDir, opts)
 *   POST /api-tests     → generateApiTests(routes, baseUrl)
 *   POST /run           → runTests(cwd, opts)
 *   GET  /coverage      → coverageReport(coverageDir, threshold)
 */

import express from 'express';
import path from 'path';
import { qaService } from './qa.service.js';
import { logger } from '../../../shared/logger.js';

export const qaRoutes = express.Router();

// POST /api/v1/qa/spec
// Body: { sourceFile: string (absolute path) }
qaRoutes.post('/spec', async (req, res) => {
    const { sourceFile } = req.body;
    if (!sourceFile || typeof sourceFile !== 'string') {
        return res.status(400).json({ success: false, message: 'sourceFile is required (absolute path).' });
    }
    try {
        const result = await qaService.generateSpec(sourceFile);
        return res.json({ success: result.success, data: result });
    } catch (e) {
        logger.error('QA /spec error:', e.message);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/v1/qa/suite
// Body: { moduleDir: string, overwrite?: boolean, exclude?: string[] }
qaRoutes.post('/suite', async (req, res) => {
    const { moduleDir, overwrite = false, exclude = [] } = req.body;
    if (!moduleDir || typeof moduleDir !== 'string') {
        return res.status(400).json({ success: false, message: 'moduleDir is required (absolute path).' });
    }
    try {
        logger.info(`🧪 QA Suite API: scanning ${moduleDir}`);
        const result = await qaService.generateSuite(moduleDir, { overwrite, exclude });
        return res.json({ success: true, data: result });
    } catch (e) {
        logger.error('QA /suite error:', e.message);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/v1/qa/api-tests
// Body: { routes: [{method, path, description?, authRequired?, bodySchema?}], baseUrl?, outputDir? }
qaRoutes.post('/api-tests', async (req, res) => {
    const { routes, baseUrl, outputDir } = req.body;
    if (!Array.isArray(routes) || routes.length === 0) {
        return res.status(400).json({ success: false, message: 'routes[] is required and must be non-empty.' });
    }
    try {
        const result = await qaService.generateApiTests(routes, baseUrl, outputDir);
        return res.json({ success: result.success, data: result });
    } catch (e) {
        logger.error('QA /api-tests error:', e.message);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// POST /api/v1/qa/run
// Body: { cwd?: string, coverage?: boolean, filter?: string }
qaRoutes.post('/run', async (req, res) => {
    const { cwd = process.cwd(), coverage = false, filter } = req.body;
    try {
        logger.info(`🧪 QA Run API: vitest in ${cwd}`);
        const result = await qaService.runTests(cwd, { coverage, filter });
        const passed = result.exitCode === 0;
        return res.json({ success: passed, data: result });
    } catch (e) {
        logger.error('QA /run error:', e.message);
        return res.status(500).json({ success: false, message: e.message });
    }
});

// GET /api/v1/qa/coverage
// Query: ?coverageDir=/path/to/coverage&threshold=80
qaRoutes.get('/coverage', async (req, res) => {
    const { coverageDir, threshold } = req.query;
    try {
        const result = await qaService.coverageReport(
            coverageDir ? String(coverageDir) : undefined,
            threshold ? Number(threshold) : undefined
        );
        return res.json({ success: result.passed, data: result });
    } catch (e) {
        logger.error('QA /coverage error:', e.message);
        return res.status(500).json({ success: false, message: e.message });
    }
});
