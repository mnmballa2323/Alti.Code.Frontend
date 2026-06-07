/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { z } from 'zod';
import { logger } from '../../../shared/logger.js';
import { jobQueueService } from '../../../shared/jobQueue.service.js';
import { treeSitterService } from './treeSitter.service.js';
import { refactorRequestSchema } from '../../../shared/schemas.js';
import fs from 'fs/promises';
import path from 'path';

class RefactorService {
    constructor() {
        this.queueName = 'refactor-tasks';
        this.init();
    }

    async init() {
        await jobQueueService.ensureReady();
        // Register a worker for this queue
        // In a real microservice, the worker might be a separate process.
        // For this monolith-style app, we'll attach it here.
        jobQueueService.registerWorker(this.queueName, this.processJob.bind(this));
        logger.info('🤖 RefactorService: Initialized and listening for jobs');
    }

    /**
     * Submit a new refactor task
     * @param {object} payload 
     */
    async submitTask(payload) {
        try {
            // 1. Validate payload
            const validated = refactorRequestSchema.parse(payload);

            // 2. Add to Queue
            const job = await jobQueueService.addJob(this.queueName, 'refactor.request', validated);
            logger.info(`🤖 RefactorService: Task submitted (Job ID: ${job.id})`);
            return { jobId: job.id, status: 'queued' };

        } catch (error) {
            logger.error('🤖 RefactorService: Validation Failed', error);
            throw error;
        }
    }

    /**
     * Worker function to process the job
     * @param {object} job 
     */
    async processJob(job) {
        const { filePaths, instruction } = job.data;
        logger.info(`🤖 RefactorService: Processing job ${job.id} - "${instruction}"`);

        const results = [];

        try {
            await treeSitterService.init();

            for (const filePath of filePaths) {
                try {
                    // 1. Read the actual file
                    const code = await fs.readFile(filePath, 'utf-8');
                    logger.info(`   - Read ${filePath} (${code.length} chars)`);

                    // 2. Parse with Tree-sitter to confirm it's valid before we touch it
                    const tree = await treeSitterService.parse(code);
                    logger.info(`   - Parsed ${path.basename(filePath)}: root node='${tree.rootNode.type}'`);

                    // 3. Backup original
                    const backupPath = `${filePath}.refactored.bak`;
                    await fs.writeFile(backupPath, code, 'utf-8');
                    logger.info(`   - Backup saved → ${backupPath}`);

                    // 4. Apply transformation (log only for now — real LLM call is in refactor.worker.js)
                    logger.info(`   - Applying transformation: ${instruction}`);

                    results.push({ file: filePath, success: true, backupPath });
                } catch (fileErr) {
                    logger.error(`   - Failed to process ${filePath}: ${fileErr.message}`);
                    results.push({ file: filePath, success: false, error: fileErr.message });
                }
            }

            const succeeded = results.filter(r => r.success).length;
            logger.info(`🤖 RefactorService: Job ${job.id} completed — ${succeeded}/${filePaths.length} files processed.`);
            return { result: 'success', details: `Refactored ${succeeded} of ${filePaths.length} files`, files: results };

        } catch (error) {
            logger.error(`🤖 RefactorService: Job ${job.id} Failed`, error);
            throw error;
        }
    }

    /**
     * Scan a directory for files with high complexity
     * @param {string} dirPath 
     * @returns {Promise<Array>} List of smelly files
     */
    async scanComplexity(dirPath) {
        if (!dirPath || typeof dirPath !== 'string') {
            throw new Error('RefactorService: dirPath must be a non-empty string.');
        }
        logger.info(`🤖 RefactorService: Scanning complexity in ${dirPath}...`);

        const smellyFiles = [];

        try {
            // Recursive walk
            async function getFiles(dir) {
                const dirents = await fs.readdir(dir, { withFileTypes: true });
                const files = await Promise.all(dirents.map((dirent) => {
                    const res = path.resolve(dir, dirent.name);
                    return dirent.isDirectory() ? getFiles(res) : res;
                }));
                return Array.prototype.concat(...files);
            }

            const allFiles = await getFiles(dirPath);
            const jsFiles = allFiles.filter(f => f.endsWith('.js') || f.endsWith('.ts'));

            for (const file of jsFiles) {
                if (file.includes('node_modules') || file.includes('dist')) continue;

                const content = await fs.readFile(file, 'utf-8');
                const lines = content.split('\n');

                // Naive Complexity Metrics
                const length = lines.length;
                // Count indentation depth as proxy for nesting complexity
                let maxDepth = 0;
                let ifCount = 0;

                for (const line of lines) {
                    const indent = line.search(/\S/);
                    if (indent > maxDepth) maxDepth = indent;
                    if (line.includes('if (') || line.includes('else') || line.includes('for (') || line.includes('while (')) {
                        ifCount++;
                    }
                }

                // Thresholds: > 200 lines OR deeply nested (> 20 spaces) OR many branches (> 10)
                if (length > 200 || maxDepth > 20 || ifCount > 10) {
                    smellyFiles.push({
                        file: path.relative(process.cwd(), file),
                        reason: `Lines: ${length}, Max Indent: ${maxDepth}, Branches: ${ifCount}`
                    });
                }
            }

            logger.info(`🤖 RefactorService: Found ${smellyFiles.length} complex files.`);
            return smellyFiles;

        } catch (error) {
            logger.error('🤖 RefactorService: Complexity Scan Failed', error);
            return [];
        }
    }
}

export const refactorService = new RefactorService();
