/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import * as llama from './llamaindex.indexer.js';

const uploadAndIndexDocumentService = async filePath => {
  return await llama.createIndexFromFiles(filePath);
};

const queryDocument = async query => {
  return await llama.askQuery(query);
};

export const ragService = {
  uploadAndIndexDocumentService,
  queryDocument,
};
