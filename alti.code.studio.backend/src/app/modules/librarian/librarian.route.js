import express from 'express';
import { librarianController } from './librarian.controller.js';

const router = express.Router();

router.post('/document-file', librarianController.documentFile);
router.post('/update-readme', librarianController.updateReadme);
router.post('/docs-site', librarianController.generateDocsSite);
router.post('/adr', librarianController.generateADR);

export const librarianRoutes = router;
