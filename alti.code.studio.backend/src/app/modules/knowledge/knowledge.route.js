/**
 * Copyright (c) 2026 Inso Code
 *
 * knowledge.route.js — API Routes for Knowledge & RAG Ingestion.
 */

import express from 'express';
import multer from 'multer';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { KnowledgeController } from './knowledge.controller.js';

const upload = multer({ dest: 'uploads/tmp/' });
const router = express.Router();

router.post(
  '/folders',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  KnowledgeController.createFolder,
);

router.get(
  '/folders',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  KnowledgeController.getFolders,
);

router.delete(
  '/folders/:folderId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  KnowledgeController.deleteFolder,
);

router.get(
  '/files',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  KnowledgeController.getAllFiles,
);

router.post(
  '/files/upload',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  upload.single('file'),
  KnowledgeController.uploadFile,
);

router.delete(
  '/files/:fileId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
  KnowledgeController.deleteFile,
);

export const knowledgeRoutes = router;
