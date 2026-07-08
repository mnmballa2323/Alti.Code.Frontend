import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { multiCloudInferenceService } from '../../src/app/modules/ai/multicloud_inference.service.js';
import { hybridRouterService } from '../../src/app/modules/ai/hybrid_router.service.js';
import fs from 'fs/promises';
import path from 'path';

describe('Multi-Cloud Inference & Marketplace Procurement Integration Tests', () => {
    const testLogPath = path.join(process.cwd(), 'logs', 'marketplace_billing.log');

    beforeEach(async () => {
        // Clean log file before each test for test isolation
        try {
            await fs.unlink(testLogPath);
        } catch (e) {
            // Ignore if file doesn't exist
        }
    });

    afterEach(async () => {
        // Clean up test logs after completion
        try {
            await fs.unlink(testLogPath);
        } catch (e) {
            // Ignore
        }
    });

    it('should successfully execute primary inference on GCP Vertex AI and log GCP Marketplace Billing', async () => {
        const prompt = 'Design a scalable GCP architecture.';
        const result = await multiCloudInferenceService.executeMultiCloudInference(prompt, 'jules', {
            preferredProvider: 'gcp',
            modelId: 'gemini-3.5-flash'
        });

        expect(result).toBeDefined();
        expect(result.provider).toContain('gcp');
        expect(result.venue).toBe('GOOGLE_VERTEX_SOVEREIGN_CLOUD');
        expect(result.content).toBeDefined();

        // Verify the GCP marketplace transaction was logged securely
        const logContent = await fs.readFile(testLogPath, 'utf-8');
        const transactions = logContent.trim().split('\n').map(JSON.parse);
        expect(transactions.length).toBe(1);

        const tx = transactions[0];
        expect(tx.cloudProvider).toBe('gcp');
        expect(tx.marketplaceSku).toBe('GCP-VERTEX-ALTI-SAAS-201');
        expect(tx.contractId).toBe('gcp-ea-vertex-4882');
        expect(tx.financials.totalCostUsd).toBeGreaterThan(0);
    });

    it('should route external provider prompts to GCP under Sovereign mode and log GCP Billing', async () => {
        const prompt = 'Use external providers to build a custom agent loop.';
        const result = await hybridRouterService.executeAgent(prompt);

        expect(result).toBeDefined();
        expect(result.venue).toBe('GOOGLE_VERTEX_SOVEREIGN_CLOUD');
        expect(result.content).toBeDefined();

        // Verify the GCP marketplace transaction was logged securely
        const logContent = await fs.readFile(testLogPath, 'utf-8');
        const transactions = logContent.trim().split('\n').map(JSON.parse);
        const tx = transactions.find(t => t.cloudProvider === 'gcp');
        expect(tx).toBeDefined();
        expect(tx.marketplaceSku).toBe('GCP-VERTEX-ALTI-SAAS-201');
        expect(tx.contractId).toBe('gcp-ea-vertex-4882');
    });

    it('should route GCP prompts to GCP and log GCP Marketplace Billing', async () => {
        const prompt = 'Route this to GCP Foundry for visual analysis.';
        const result = await hybridRouterService.executeAgent(prompt);

        expect(result).toBeDefined();
        expect(result.venue).toBe('GOOGLE_VERTEX_SOVEREIGN_CLOUD');
        expect(result.content).toBeDefined();

        // Verify the GCP marketplace transaction was logged securely
        const logContent = await fs.readFile(testLogPath, 'utf-8');
        const transactions = logContent.trim().split('\n').map(JSON.parse);
        const tx = transactions.find(t => t.cloudProvider === 'gcp');
        expect(tx).toBeDefined();
        expect(tx.marketplaceSku).toBe('GCP-VERTEX-ALTI-SAAS-201');
        expect(tx.contractId).toBe('gcp-ea-vertex-4882');
    });

    it('should accurately aggregate and summarize marketplace procurement metrics solely on GCP', async () => {
        // Execute multiple requests (all will resolve to GCP)
        await multiCloudInferenceService.executeMultiCloudInference('Query 1', 'jules', { preferredProvider: 'gcp' });
        await multiCloudInferenceService.executeMultiCloudInference('Query 2', 'jules', { preferredProvider: 'gcp' });
        await multiCloudInferenceService.executeMultiCloudInference('Query 3', 'jules', { preferredProvider: 'gcp' });

        const stats = await multiCloudInferenceService.getMarketplaceProcurementStats();

        expect(stats).toBeDefined();
        expect(stats.gcp.transactionCount).toBe(3);
        expect(stats.global.totalTransactions).toBe(3);
        expect(stats.global.totalBilledUsd).toBeGreaterThan(0);
        expect(stats.global.totalTokens).toBeGreaterThan(0);
    });
});
