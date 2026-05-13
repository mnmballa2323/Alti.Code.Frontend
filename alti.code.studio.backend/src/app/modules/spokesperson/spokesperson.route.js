import express from 'express';
import { spokespersonController } from './spokesperson.controller.js';

const router = express.Router();

router.get('/changelog', spokespersonController.generateChangelog);
router.post('/release-notes', spokespersonController.draftReleaseNotes);
router.post('/polish-readme', spokespersonController.polishReadme);

export const spokespersonRoutes = router;
