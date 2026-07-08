import express from 'express';
import { cloudMarketplaceController } from './cloud_marketplace.controller.js';

const router = express.Router();

// SaaS Entitlement Resolutions
router.post('/gcp/resolve', cloudMarketplaceController.resolveGcp);

// User Subscription Details
router.get('/user/:userId', cloudMarketplaceController.getEntitlements);

// Cron/Manual Billing Synchronizer
router.post('/billing/sync', cloudMarketplaceController.syncBilling);

export const cloudMarketplaceRoutes = router;
