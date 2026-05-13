import express from 'express';
import { productOwnerController } from './productOwner.controller.js';
// import { authMiddleware } from '../../middlewares/auth.middleware.js';
// import { ENUM_USER_ROLE } from '../../../enums/user.js';

const router = express.Router();

// Public for now, add auth later
router.post('/analyze', productOwnerController.analyzeRequest);
router.post('/stories', productOwnerController.generateStories);
router.post('/backlog', productOwnerController.addToBacklog);
router.post('/backlog/:id/spec', productOwnerController.commissionSpec);

export const productOwnerRoutes = router;
