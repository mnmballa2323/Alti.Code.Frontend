import express from 'express';
import { scribeController } from './scribe.controller.js';

const router = express.Router();

router.post('/document', scribeController.documentCode);
router.post('/wiki', scribeController.updateWiki);

export const scribeRoutes = router;
