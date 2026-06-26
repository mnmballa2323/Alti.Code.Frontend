/**
 * Copyright (c) 2024 Inso Code
 *
 * Gemini File Search Controller
 * Production-hardened REST API surface for File Search RAG infrastructure.
 * Enforces input validation, sanitization, query bounds, and audit trails.
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { fileSearchService } from './fileSearch.service.js';
import { logger } from '../../../shared/logger.js';

// ─────────────────────────────────────────────
// Input Guards
// ─────────────────────────────────────────────

/** Validates a URL path parameter is safe (no traversal, no null bytes) */
function assertSafeParam(value, name) {
  if (!value || typeof value !== 'string') {
    throw Object.assign(new Error(`${name} is required.`), {
      statusCode: httpStatus.BAD_REQUEST,
    });
  }
  if (
    value.includes('..') ||
    value.includes('\x00') ||
    value.includes('/') ||
    value.includes('\\')
  ) {
    throw Object.assign(new Error(`${name} contains forbidden characters.`), {
      statusCode: httpStatus.BAD_REQUEST,
    });
  }
  return value.trim();
}

/** Asserts a request body field is a non-empty string */
function assertString(value, name, maxLength = 10000) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw Object.assign(
      new Error(`${name} is required and must be a non-empty string.`),
      { statusCode: httpStatus.BAD_REQUEST },
    );
  }
  if (value.length > maxLength) {
    throw Object.assign(
      new Error(`${name} exceeds maximum length of ${maxLength}.`),
      { statusCode: httpStatus.BAD_REQUEST },
    );
  }
  return value.trim();
}

/** Asserts storeNames is a valid non-empty string array */
function assertStoreNames(storeNames) {
  if (!Array.isArray(storeNames) || storeNames.length === 0) {
    throw Object.assign(
      new Error('storeNames must be a non-empty array of strings.'),
      { statusCode: httpStatus.BAD_REQUEST },
    );
  }
  if (storeNames.length > 20) {
    throw Object.assign(
      new Error('storeNames cannot contain more than 20 entries.'),
      { statusCode: httpStatus.BAD_REQUEST },
    );
  }
  for (const name of storeNames) {
    if (!name || typeof name !== 'string') {
      throw Object.assign(
        new Error('Each storeName must be a non-empty string.'),
        { statusCode: httpStatus.BAD_REQUEST },
      );
    }
  }
  return storeNames;
}

// ─────────────────────────────────────────────
// Store Management
// ─────────────────────────────────────────────

const createStore = catchAsync(async (req, res) => {
  const displayName = assertString(req.body.displayName, 'displayName', 256);
  const embeddingModel = req.body.embeddingModel || undefined;

  const store = await fileSearchService.createStore(
    displayName,
    embeddingModel,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'File Search Store created.',
    data: store,
  });
});

const listStores = catchAsync(async (req, res) => {
  const stores = await fileSearchService.listStores();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Found ${stores.length} File Search Store(s).`,
    data: stores,
  });
});

const getStore = catchAsync(async (req, res) => {
  const storeName = assertSafeParam(req.params.storeName, 'storeName');
  const store = await fileSearchService.getStore(
    `fileSearchStores/${storeName}`,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File Search Store retrieved.',
    data: store,
  });
});

const deleteStore = catchAsync(async (req, res) => {
  const storeName = assertSafeParam(req.params.storeName, 'storeName');
  const force = req.query.force === 'true';

  await fileSearchService.deleteStore(`fileSearchStores/${storeName}`, force);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File Search Store deleted.',
  });
});

// ─────────────────────────────────────────────
// File Upload & Import
// ─────────────────────────────────────────────

const uploadFile = catchAsync(async (req, res) => {
  const storeName = assertSafeParam(req.params.storeName, 'storeName');
  const filePath = assertString(req.body.filePath, 'filePath', 4096);
  const displayName = assertString(req.body.displayName, 'displayName', 256);

  const result = await fileSearchService.uploadFile(
    `fileSearchStores/${storeName}`,
    filePath,
    displayName,
    req.body.chunkingConfig || null,
    req.body.customMetadata || null,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'File uploaded and indexed successfully.',
    data: result,
  });
});

const importFile = catchAsync(async (req, res) => {
  const storeName = assertSafeParam(req.params.storeName, 'storeName');
  const fileName = assertString(req.body.fileName, 'fileName', 1024);

  const result = await fileSearchService.importFile(
    `fileSearchStores/${storeName}`,
    fileName,
    req.body.chunkingConfig || null,
    req.body.customMetadata || null,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'File imported and indexed successfully.',
    data: result,
  });
});

// ─────────────────────────────────────────────
// Document Management
// ─────────────────────────────────────────────

const listDocuments = catchAsync(async (req, res) => {
  const storeName = assertSafeParam(req.params.storeName, 'storeName');
  const documents = await fileSearchService.listDocuments(
    `fileSearchStores/${storeName}`,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Found ${documents.length} document(s).`,
    data: documents,
  });
});

const getDocument = catchAsync(async (req, res) => {
  const storeName = assertSafeParam(req.params.storeName, 'storeName');
  const documentId = assertSafeParam(req.params.documentId, 'documentId');

  const document = await fileSearchService.getDocument(
    `fileSearchStores/${storeName}/documents/${documentId}`,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Document retrieved.',
    data: document,
  });
});

const deleteDocument = catchAsync(async (req, res) => {
  const storeName = assertSafeParam(req.params.storeName, 'storeName');
  const documentId = assertSafeParam(req.params.documentId, 'documentId');

  await fileSearchService.deleteDocument(
    `fileSearchStores/${storeName}/documents/${documentId}`,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Document deleted.',
  });
});

// ─────────────────────────────────────────────
// RAG Query
// ─────────────────────────────────────────────

const queryStores = catchAsync(async (req, res) => {
  const query = assertString(req.body.query, 'query', 32000);
  const storeNames = assertStoreNames(req.body.storeNames);

  const result = await fileSearchService.query(query, storeNames, {
    model: req.body.model,
    metadataFilter: req.body.metadataFilter,
    systemInstruction: req.body.systemInstruction,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File Search RAG query complete.',
    data: result,
  });
});

const queryStructured = catchAsync(async (req, res) => {
  const query = assertString(req.body.query, 'query', 32000);
  const storeNames = assertStoreNames(req.body.storeNames);

  if (!req.body.jsonSchema || typeof req.body.jsonSchema !== 'object') {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'jsonSchema must be a valid JSON object.',
    });
  }

  const result = await fileSearchService.queryStructured(
    query,
    storeNames,
    req.body.jsonSchema,
    { model: req.body.model },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Structured File Search query complete.',
    data: result,
  });
});

export const FileSearchController = {
  createStore,
  listStores,
  getStore,
  deleteStore,
  uploadFile,
  importFile,
  listDocuments,
  getDocument,
  deleteDocument,
  queryStores,
  queryStructured,
};
