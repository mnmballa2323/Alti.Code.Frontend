import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cloudMarketplaceService } from '../../src/app/modules/marketplace/cloud_marketplace.service.js';
import fs from 'fs/promises';
import path from 'path';

describe('Cloud Marketplace Procurement & SaaS Integration Tests', () => {
    const entitlementsPath = path.join(process.cwd(), 'logs', 'marketplace_entitlements.json');
    const billingLogPath = path.join(process.cwd(), 'logs', 'marketplace_billing.log');

    let originalEntitlements = null;

    beforeEach(async () => {
        // Backup existing entitlements if any
        try {
            originalEntitlements = await fs.readFile(entitlementsPath, 'utf-8');
        } catch (e) {
            originalEntitlements = null;
        }

        // Clean database for isolation
        await fs.mkdir(path.dirname(entitlementsPath), { recursive: true });
        await fs.writeFile(entitlementsPath, JSON.stringify({ gcp: {} }, null, 2), 'utf-8');
        await fs.writeFile(billingLogPath, '', 'utf-8');
    });

    afterEach(async () => {
        // Restore backup
        if (originalEntitlements) {
            await fs.writeFile(entitlementsPath, originalEntitlements, 'utf-8');
        } else {
            try {
                await fs.unlink(entitlementsPath);
            } catch (e) {
                // Ignore
            }
        }
        try {
            await fs.unlink(billingLogPath);
        } catch (e) {
            // Ignore
        }
    });

    it('should successfully resolve and register a GCP Marketplace entitlement token', async () => {
        const token = 'gcp-mkt-token-abc-12345';
        const userId = 'user-gcp-enterprise-01';

        const result = await cloudMarketplaceService.resolveGcpEntitlement(token, userId);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.provider).toBe('gcp');
        expect(result.customerId).toBeDefined();
        expect(result.subscriptionId).toBeDefined();
        expect(result.status).toBe('ACTIVE');

        // Check if database contains it
        const status = await cloudMarketplaceService.getUserEntitlementStatus(userId);
        expect(status.hasActiveSubscription).toBe(true);
        expect(status.subscriptions.gcp).toBeDefined();
        expect(status.subscriptions.gcp.userId).toBe(userId);
    });


    it('should accurately batch and dispatch metered billing logs, clearing local logs after sync', async () => {
        // Seed mock billing logs
        const mockLogs = [
            JSON.stringify({
                timestamp: new Date().toISOString(),
                cloudProvider: 'gcp',
                marketplaceSku: 'GCP-MKT-ALTI-SWARM-001',
                financials: { totalCostUsd: 1.50 }
            })
        ].join('\n') + '\n';

        await fs.writeFile(billingLogPath, mockLogs, 'utf-8');

        // Sync billing
        const syncResult = await cloudMarketplaceService.processMeteredBillingBatch();

        expect(syncResult).toBeDefined();
        expect(syncResult.success).toBe(true);
        expect(syncResult.synchronizedTransactions).toBe(1);
        expect(syncResult.totalBilledUsd).toBe(1.50);

        // Verify local logs were cleared
        const clearedContent = await fs.readFile(billingLogPath, 'utf-8');
        expect(clearedContent.trim()).toBe('');
    });
});
