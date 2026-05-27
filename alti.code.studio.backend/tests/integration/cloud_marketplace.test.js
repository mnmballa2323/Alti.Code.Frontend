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
        await fs.writeFile(entitlementsPath, JSON.stringify({ gcp: {}, aws: {}, azure: {} }, null, 2), 'utf-8');
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

    it('should successfully resolve and register an AWS Marketplace customer token', async () => {
        const token = 'aws-mp-reg-token-xyz-98765';
        const userId = 'user-aws-enterprise-02';

        const result = await cloudMarketplaceService.resolveAwsEntitlement(token, userId);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.provider).toBe('aws');
        expect(result.customerId).toBeDefined();
        expect(result.status).toBe('ACTIVE');

        const status = await cloudMarketplaceService.getUserEntitlementStatus(userId);
        expect(status.hasActiveSubscription).toBe(true);
        expect(status.subscriptions.aws).toBeDefined();
        expect(status.subscriptions.aws.userId).toBe(userId);
    });

    it('should successfully resolve and activate an Azure SaaS subscription', async () => {
        const token = 'azure-saas-token-qrs-45678';
        const userId = 'user-azure-enterprise-03';

        const result = await cloudMarketplaceService.resolveAzureEntitlement(token, userId);

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.provider).toBe('azure');
        expect(result.subscriptionId).toBeDefined();
        expect(result.status).toBe('ACTIVE');

        const status = await cloudMarketplaceService.getUserEntitlementStatus(userId);
        expect(status.hasActiveSubscription).toBe(true);
        expect(status.subscriptions.azure).toBeDefined();
        expect(status.subscriptions.azure.userId).toBe(userId);
    });

    it('should accurately batch and dispatch metered billing logs, clearing local logs after sync', async () => {
        // Seed mock billing logs
        const mockLogs = [
            JSON.stringify({
                timestamp: new Date().toISOString(),
                cloudProvider: 'gcp',
                marketplaceSku: 'GCP-MKT-ALTI-SWARM-001',
                financials: { totalCostUsd: 1.50 }
            }),
            JSON.stringify({
                timestamp: new Date().toISOString(),
                cloudProvider: 'aws',
                marketplaceSku: 'AWS-MP-ALTI-BEDROCK-042',
                financials: { totalCostUsd: 3.00 }
            }),
            JSON.stringify({
                timestamp: new Date().toISOString(),
                cloudProvider: 'azure',
                marketplaceSku: 'AZ-FOUNDRY-ALTI-SAAS-109',
                financials: { totalCostUsd: 2.25 }
            })
        ].join('\n') + '\n';

        await fs.writeFile(billingLogPath, mockLogs, 'utf-8');

        // Sync billing
        const syncResult = await cloudMarketplaceService.processMeteredBillingBatch();

        expect(syncResult).toBeDefined();
        expect(syncResult.success).toBe(true);
        expect(syncResult.synchronizedTransactions).toBe(3);
        expect(syncResult.totalBilledUsd).toBe(6.75);

        // Verify local logs were cleared
        const clearedContent = await fs.readFile(billingLogPath, 'utf-8');
        expect(clearedContent.trim()).toBe('');
    });
});
