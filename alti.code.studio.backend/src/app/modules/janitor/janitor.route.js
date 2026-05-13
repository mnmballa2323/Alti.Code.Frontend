import express from 'express';
import { janitorController } from './janitor.controller.js';

const router = express.Router();

router.post('/sweep', janitorController.sweepCode);
router.post('/todos', janitorController.aggregateTodos);

export const janitorRoutes = router;
