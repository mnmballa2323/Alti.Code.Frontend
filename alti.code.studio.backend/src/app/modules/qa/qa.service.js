/**
 * QA Service v2 — Multi-file test generation, coverage enforcement, API test gen
 *
 * Upgrades over v1:
 *   - generateSpec()       : Single file (unchanged, backward-compatible)
 *   - generateSuite()      : Multi-file test suite for an entire module directory
 *   - generateApiTests()   : Integration tests from OpenAPI/Express route info
 *   - runTests()           : Execute vitest and return structured results
 *   - coverageReport()     : Parse coverage JSON and enforce thresholds
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

/** Minimum coverage % to pass threshold check */
const DEFAULT_COVERAGE_THRESHOLD = 80;

/** Max source chars to send per LLM call */
const MAX_SOURCE_CHARS = 6000;

class QAService {
    // ─────────────────────────────────────────────────────────────────
    // generateSpec — single file (backward-compatible with v1)
    // ─────────────────────────────────────────────────────────────────
    async generateSpec(sourceFile) {
        logger.info(`🧪 QA: Generating spec for ${path.basename(sourceFile)}`);

        try {
            const sourceCode = await fs.readFile(sourceFile, 'utf-8');
            const fileName = path.basename(sourceFile);
            const { dir, name } = path.parse(sourceFile);
            const testFileName = path.join(dir, `${name}.test.js`);

            const prompt = `
You are the QA Architect, an expert in testing Node.js applications with Vitest.

Task: Write a comprehensive unit test suite for the following module.

Module Name: ${fileName}
Source Code:
\`\`\`javascript
${sourceCode.substring(0, MAX_SOURCE_CHARS)}
\`\`\`

Requirements:
1. Use 'vitest' (import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest').
2. Mock ALL external dependencies (imports) using 'vi.mock()'.
3. Cover: all exported functions, success paths, error/edge cases, boundary values.
4. Use descriptive test names (should_return_X_when_Y).
5. Group tests with nested describe blocks (module → function → scenario).
6. Return ONLY the JavaScript code for the test file, no markdown.
`.trim();

            const rawResponse = await GeminiAiService.generateContent(prompt);
            const cleanedCode = rawResponse.replace(/^```(?:javascript|js|ts)?\n?/m, '').replace(/\n?```$/m, '').trim();

            // Write only if test doesn't already exist
            try {
                await fs.access(testFileName);
                logger.warn(`🧪 QA: Test already exists — ${testFileName}. Skipping.`);
            } catch {
                await fs.writeFile(testFileName, cleanedCode);
                logger.info(`🧪 QA: Generated → ${testFileName}`);
            }

            return { success: true, testFile: testFileName, content: cleanedCode };
        } catch (error) {
            logger.error('🧪 QA: generateSpec failed', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // generateSuite — generate tests for ALL .js files in a directory
    // ─────────────────────────────────────────────────────────────────
    /**
     * @param {string} moduleDir - Absolute path to directory containing source files
     * @param {object} [opts]
     * @param {boolean} [opts.overwrite=false] - Overwrite existing test files
     * @param {string[]} [opts.exclude=[]] - File basenames to skip (e.g. ['index.js'])
     * @returns {Promise<{generated: string[], skipped: string[], failed: string[]}>}
     */
    async generateSuite(moduleDir, opts = {}) {
        const { overwrite = false, exclude = ['index.js'] } = opts;
        logger.info(`🧪 QA Suite: Scanning ${moduleDir}`);

        const results = { generated: [], skipped: [], failed: [] };
        let entries;

        try {
            entries = await fs.readdir(moduleDir);
        } catch (e) {
            logger.error(`🧪 QA Suite: Cannot read directory ${moduleDir}:`, e.message);
            return results;
        }

        const sourceFiles = entries.filter(f =>
            /\.(js|ts|jsx|tsx)$/.test(f) &&
            !f.includes('.test.') &&
            !f.includes('.spec.') &&
            !exclude.includes(f)
        );

        logger.info(`🧪 QA Suite: Found ${sourceFiles.length} source files to cover`);

        // Process files in parallel batches of 3
        const BATCH_SIZE = 3;
        for (let i = 0; i < sourceFiles.length; i += BATCH_SIZE) {
            const batch = sourceFiles.slice(i, i + BATCH_SIZE);
            await Promise.allSettled(batch.map(async (file) => {
                const fullPath = path.join(moduleDir, file);
                const { name } = path.parse(fullPath);
                const testFile = path.join(moduleDir, `${name}.test.js`);

                if (!overwrite) {
                    try {
                        await fs.access(testFile);
                        results.skipped.push(testFile);
                        return;
                    } catch { /* doesn't exist, proceed */ }
                }

                const result = await this.generateSpec(fullPath);
                if (result.success) {
                    results.generated.push(result.testFile);
                } else {
                    results.failed.push(fullPath);
                }
            }));
        }

        logger.info(`🧪 QA Suite: ✅ ${results.generated.length} generated, ⏭️ ${results.skipped.length} skipped, ❌ ${results.failed.length} failed`);
        return results;
    }

    // ─────────────────────────────────────────────────────────────────
    // generateApiTests — integration tests from route information
    // ─────────────────────────────────────────────────────────────────
    /**
     * @param {object[]} routes - Array of { method, path, description, bodySchema, authRequired }
     * @param {string}   [baseUrl='http://localhost:5000/api/v1']
     * @returns {Promise<{success, content, testFile}>}
     */
    async generateApiTests(routes, baseUrl = 'http://localhost:5000/api/v1', outputDir = process.cwd()) {
        logger.info(`🧪 QA API: Generating integration tests for ${routes.length} routes`);

        const routeList = routes.map(r =>
            `${r.method.toUpperCase()} ${r.path}${r.authRequired ? ' [REQUIRES_AUTH]' : ''}${r.description ? ` — ${r.description}` : ''}`
        ).join('\n');

        const prompt = `
You are an API integration test expert using Vitest + supertest (or fetch API).

Generate comprehensive integration tests for these API routes:
Base URL: ${baseUrl}

Routes:
${routeList}

Requirements:
1. Use vitest + node fetch (global fetch) OR supertest (import request from 'supertest').
2. Group by route using describe() blocks.
3. Test: 200/201 success, 400 bad request, 401 unauthorized (if auth required), 404 not found.
4. For auth-required routes, test with AND without a valid Bearer token.
5. Validate response shape (expect(body).toHaveProperty('success')).
6. Include beforeAll/afterAll for any setup/teardown (e.g. create test user, cleanup).
7. Return ONLY the complete JavaScript test file. No markdown.
`.trim();

        try {
            const rawResponse = await GeminiAiService.generateContent(prompt);
            const cleanedCode = rawResponse.replace(/^```(?:javascript|js|ts)?\n?/m, '').replace(/\n?```$/m, '').trim();

            const testFile = path.join(outputDir, 'api.integration.test.js');
            await fs.writeFile(testFile, cleanedCode);
            logger.info(`🧪 QA API: Integration tests written → ${testFile}`);
            return { success: true, testFile, content: cleanedCode };
        } catch (error) {
            logger.error('🧪 QA API: generateApiTests failed', error);
            return { success: false, error: error.message };
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // runTests — execute vitest and return structured results
    // ─────────────────────────────────────────────────────────────────
    /**
     * @param {string}  cwd           - Directory to run vitest in
     * @param {object}  [opts]
     * @param {boolean} [opts.coverage=false] - Enable coverage collection
     * @param {string}  [opts.filter]         - Test file pattern/filter
     * @returns {Promise<{passed, failed, total, duration, output, exitCode}>}
     */
    async runTests(cwd = process.cwd(), opts = {}) {
        const { coverage = false, filter } = opts;
        logger.info(`🧪 QA Run: Executing vitest in ${cwd} (coverage=${coverage})`);

        const args = ['vitest', 'run', '--reporter=json'];
        if (coverage) args.push('--coverage');
        if (filter) args.push(filter);

        return new Promise((resolve) => {
            let output = '';
            let jsonStart = -1;

            const proc = spawn('npx', args, {
                cwd,
                shell: true,
                env: { ...process.env, FORCE_COLOR: '0' },
            });

            proc.stdout.on('data', (data) => { output += data.toString(); });
            proc.stderr.on('data', (data) => { output += data.toString(); });

            proc.on('close', (exitCode) => {
                // Try to parse the JSON reporter output
                try {
                    const jsonMatch = output.match(/\{[\s\S]*"testResults"[\s\S]*\}/);
                    if (jsonMatch) {
                        const report = JSON.parse(jsonMatch[0]);
                        const passed = report.numPassedTests ?? 0;
                        const failed = report.numFailedTests ?? 0;
                        const total = report.numTotalTests ?? 0;
                        const duration = report.startTime ? (Date.now() - report.startTime) : null;
                        logger.info(`🧪 QA Run: ${passed}/${total} passed, ${failed} failed. Exit: ${exitCode}`);
                        return resolve({ passed, failed, total, duration, output, exitCode, report });
                    }
                } catch { /* fall through to raw output */ }

                // Fallback: count from output
                const passMatch = output.match(/(\d+)\s+passed/i);
                const failMatch = output.match(/(\d+)\s+failed/i);
                const passed = passMatch ? parseInt(passMatch[1]) : 0;
                const failed = failMatch ? parseInt(failMatch[1]) : 0;

                logger.info(`🧪 QA Run (parsed): ${passed} passed, ${failed} failed. Exit: ${exitCode}`);
                resolve({ passed, failed, total: passed + failed, output, exitCode });
            });

            // Safety timeout
            setTimeout(() => {
                proc.kill();
                resolve({ passed: 0, failed: 0, total: 0, output: 'Test run timed out after 5 minutes', exitCode: -1 });
            }, 5 * 60 * 1000);
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // coverageReport — parse v8/istanbul JSON and enforce thresholds
    // ─────────────────────────────────────────────────────────────────
    /**
     * @param {string} coverageDir   - Path to coverage-summary.json parent
     * @param {number} [threshold]   - Minimum % to pass (default 80)
     * @returns {Promise<{passed, lines, branches, functions, statements, failures}>}
     */
    async coverageReport(coverageDir = path.join(process.cwd(), 'coverage'), threshold = DEFAULT_COVERAGE_THRESHOLD) {
        const summaryPath = path.join(coverageDir, 'coverage-summary.json');
        logger.info(`🧪 QA Coverage: Reading ${summaryPath} (threshold: ${threshold}%)`);

        try {
            const raw = await fs.readFile(summaryPath, 'utf-8');
            const summary = JSON.parse(raw);
            const total = summary.total;

            const metrics = {
                lines: total.lines?.pct ?? 0,
                branches: total.branches?.pct ?? 0,
                functions: total.functions?.pct ?? 0,
                statements: total.statements?.pct ?? 0,
            };

            const failures = Object.entries(metrics)
                .filter(([, pct]) => pct < threshold)
                .map(([metric, pct]) => ({ metric, pct, required: threshold, gap: threshold - pct }));

            const passed = failures.length === 0;
            logger.info(`🧪 Coverage: ${passed ? '✅ PASS' : '❌ FAIL'} — Lines: ${metrics.lines}%, Branches: ${metrics.branches}%, Fns: ${metrics.functions}%, Stmts: ${metrics.statements}%`);

            return { passed, threshold, ...metrics, failures };
        } catch (error) {
            logger.error('🧪 Coverage: Failed to read coverage-summary.json', error.message);
            return { passed: false, error: error.message };
        }
    }
}

export const qaService = new QAService();
