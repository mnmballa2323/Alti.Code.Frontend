import express from 'express';
import { IapController } from './iap.controller.js';
import { iapService } from './iap.service.js';

const router = express.Router();

router.get(
    '/verify',
    iapService.verifyIAPToken, // Use the IAP middleware directly
    IapController.verifyIdentity
);

export const IapRoutes = router;
