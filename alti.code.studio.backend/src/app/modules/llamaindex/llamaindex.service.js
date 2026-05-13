/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as llama from './llamaindex.indexer.js';
import { logger } from '../../../shared/logger.js';

/**
 * Upload and index documents via LlamaIndex.
 * @param {string} filePath - Absolute path to the file or directory to index.
 */
const uploadAndIndexDocument = async (filePath) => {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('LlamaIndexService: filePath must be a non-empty string.');
  }
  logger.info(`📚 LlamaIndexService: Indexing document at "${filePath}"...`);
  return await llama.createIndexFromFiles(filePath);
};

/**
 * Run a natural-language query against the indexed documents.
 * @param {string} query
 */
const queryDocument = async (query) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('LlamaIndexService: query must be a non-empty string.');
  }
  logger.info(`🔎 LlamaIndexService: Querying — "${query.substring(0, 80)}"`);
  return await llama.askQuery(query);
};

// Exported as llamaIndexService (not ragService) to avoid collision with memory/rag.service.js
export const llamaIndexService = {
  uploadAndIndexDocument,
  queryDocument,
};
