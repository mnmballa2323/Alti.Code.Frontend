/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

/** Max concurrent AI documentation calls to avoid rate limits. */
const CONCURRENT_LIMIT = 4;

class DocGenService {
    constructor() {
        this.ignoredDirs = new Set(['node_modules', '.git', 'dist', 'coverage', 'logs', '.shadow', '.next']);
        this.supportedExtensions = new Set(['.js', '.ts', '.jsx', '.tsx']);
    }

    /** Reset stats — call before each enrichDirectory run. */
    _resetStats() {
        this.stats = { total: 0, documented: 0, skipped: 0, failed: 0 };
    }

    /**
     * Add JSDoc comments to a single file using Gemini AI.
     * @param {string} filePath - Absolute path to the source file
     * @returns {Promise<boolean>} true if documented, false if skipped/failed
     */
    async enrichFile(filePath) {
        try {
            logger.info(`📜 DocGen: Reading ${filePath}...`);
            const content = await fs.readFile(filePath, 'utf8');

            // Skip if already has JSDoc annotations
            if (content.includes('/**') && content.includes('@param')) {
                logger.info(`⏩ DocGen: Skipping ${filePath} (already documented)`);
                this.stats.skipped++;
                return false;
            }

            // Truncate very large files to avoid token limit errors
            const truncated = content.substring(0, 8000);

            const prompt = `
                You are a Senior Technical Writer.
                Add JSDoc comments to the following JavaScript/TypeScript code.
                - Document parameters, return types, and exceptions.
                - Use @param, @returns, @throws.
                - Do NOT change the code logic. Only add comments.
                - Return the FULL file content with comments added.
                - Do not wrap output in markdown backticks. Return raw code only.

                Code:
                ${truncated}
            `;

            logger.info(`📜 DocGen: Generating documentation for ${path.basename(filePath)}...`);
            const enrichedCode = await GeminiAiService.generateContent(prompt);

            // Strip any markdown fences the model might add
            const cleanCode = enrichedCode
                .replace(/^```(?:javascript|typescript|js|ts)?\n?/m, '')
                .replace(/\n?```$/m, '')
                .trim();

            await fs.writeFile(filePath, cleanCode);
            logger.info(`✅ DocGen: Documented ${filePath}`);
            if (!this.stats) this._resetStats();
            this.stats.documented++;
            return true;

        } catch (error) {
            logger.error(`❌ DocGen: Failed for ${filePath}: ${error.message}`);
            if (!this.stats) this._resetStats();
            this.stats.failed++;
            return false;
        }
    }

    /**
     * Recursively collect all eligible file paths under dirPath.
     * @param {string} dirPath
     * @returns {Promise<string[]>}
     */
    async _collectFiles(dirPath) {
        const files = [];
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                if (!this.ignoredDirs.has(entry.name)) {
                    files.push(...await this._collectFiles(fullPath));
                }
            } else if (entry.isFile() && this.supportedExtensions.has(path.extname(entry.name))) {
                files.push(fullPath);
            }
        }
        return files;
    }

    /**
     * Recursively scan and document all eligible files in a directory.
     * Processes files in parallel batches for speed.
     *
     * @param {string} dirPath - Directory to scan
     * @returns {Promise<object>} stats object
     */
    async enrichDirectory(dirPath) {
        this._resetStats(); // Always reset so stats don't accumulate across repeated calls

        try {
            const allFiles = await this._collectFiles(dirPath);
            this.stats.total = allFiles.length;

            logger.info(`📜 DocGen: Found ${allFiles.length} eligible files. Processing in batches of ${CONCURRENT_LIMIT}...`);

            // Process in parallel batches to avoid overwhelming the AI API
            for (let i = 0; i < allFiles.length; i += CONCURRENT_LIMIT) {
                const batch = allFiles.slice(i, i + CONCURRENT_LIMIT);
                await Promise.all(batch.map(file => this.enrichFile(file)));
            }

            logger.info(`📜 DocGen: Complete — ${this.stats.documented} documented, ${this.stats.skipped} skipped, ${this.stats.failed} failed.`);
            return this.stats;

        } catch (error) {
            logger.error(`❌ DocGen: Directory scan failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate and write a Markdown documentation coverage report.
     * @param {string} [outputDir='./'] - Directory to write the report
     * @returns {Promise<string|undefined>} Report file path
     */
    async generateCoverageReport(outputDir = './') {
        const { total, documented, skipped, failed } = this.stats ?? { total: 0, documented: 0, skipped: 0, failed: 0 };
        const coverage = total > 0 ? ((documented / total) * 100).toFixed(1) : '0.0';
        const status = total > 0 && failed === 0 ? '✅ **Healthy**' : '⚠️ **Needs Attention**';

        const report = `# 📜 Documentation Coverage Report
Generated: ${new Date().toISOString()}

| Category | Count |
| :--- | :--- |
| **Total Files Scanned** | ${total} |
| **Successfully Documented** | ${documented} |
| **Skipped (Already Done)** | ${skipped} |
| **Failed** | ${failed} |
| **Coverage** | ${coverage}% |

## Status
${status}
`;

        try {
            const reportPath = path.join(outputDir, 'DOCS_COVERAGE.md');
            await fs.writeFile(reportPath, report);
            logger.info(`📄 DocGen: Coverage report written to ${reportPath}`);
            return reportPath;
        } catch (error) {
            logger.error('❌ DocGen: Failed to write coverage report', error);
        }
    }
}

export const docGenService = new DocGenService();
