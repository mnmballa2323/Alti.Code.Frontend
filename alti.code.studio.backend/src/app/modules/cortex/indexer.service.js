/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { VectorMemory } from '../../shared/memory.js';

class IndexerService {
    constructor() {
        this.ignorePatterns = ['node_modules', '.git', 'dist', 'build', 'coverage', '.env'];
        this.allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.html', '.css', '.py', '.java', '.go', '.rs'];
    }

    async indexRepo(dirPath) {
        logger.info(`🧠 Indexer: Starting analysis of ${dirPath}...`);
        let processedCount = 0;
        let diffCount = 0; // In future, check hash to skip unchanged

        const files = await this._getFilesRecursively(dirPath);
        logger.info(`🧠 Indexer: Found ${files.length} candidate files.`);

        for (const file of files) {
            try {
                const content = await fs.readFile(file, 'utf-8');
                if (!content.trim()) continue;

                // Basic Metadata
                const relativePath = path.relative(dirPath, file);
                const metadata = {
                    filePath: relativePath,
                    absolutePath: file,
                    type: 'code',
                    extension: path.extname(file),
                    indexedAt: new Date().toISOString()
                };

                // Store in Vector DB
                // Note: For large files, we should chunk. 
                // For this MVP, we treat the whole file as one chunk (or first 8k tokens approx).
                // Vertex AI embedding limit is quite high (3k-8k tokens depending on model).

                // Truncate if too huge (naive safety)
                const safeContent = content.substring(0, 20000);

                await VectorMemory.add(safeContent, metadata);
                processedCount++;

                if (processedCount % 10 === 0) {
                    logger.info(`🧠 Indexer: Processed ${processedCount}/${files.length} files...`);
                }

            } catch (error) {
                logger.warn(`🧠 Indexer: Failed to process ${file}`, error.message);
            }
        }

        logger.info(`🧠 Indexer: Complete. Indexed ${processedCount} files.`);
        return { success: true, count: processedCount, total: files.length };
    }

    async _getFilesRecursively(dir) {
        let results = [];
        try {
            const list = await fs.readdir(dir);
            for (const file of list) {
                if (this.ignorePatterns.includes(file)) continue;

                const filePath = path.join(dir, file);
                const stat = await fs.stat(filePath);

                if (stat && stat.isDirectory()) {
                    results = results.concat(await this._getFilesRecursively(filePath));
                } else {
                    if (this.allowedExtensions.includes(path.extname(filePath))) {
                        results.push(filePath);
                    }
                }
            }
        } catch (error) {
            logger.error(`Indexer error reading dir ${dir}`, error);
        }
        return results;
    }
}

export const indexerService = new IndexerService();
