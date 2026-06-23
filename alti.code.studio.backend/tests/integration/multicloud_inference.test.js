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

    it('should successfully execute primary inference on Azure OpenAI Foundry and log Azure Marketplace Billing', async () => {
        const prompt = 'Design a scalable Azure architecture.';
        const result = await multiCloudInferenceService.executeMultiCloudInference(prompt, 'jules', {
            preferredProvider: 'azure',
            modelId: 'gpt-5.5'
        });

        expect(result).toBeDefined();
        expect(result.provider).toBe('azure');
        expect(result.venue).toBe('AZURE_FOUNDRY_MARKETPLACE');
        expect(result.content).toBeDefined();

        // Verify the Azure marketplace transaction was logged securely
        const logContent = await fs.readFile(testLogPath, 'utf-8');
        const transactions = logContent.trim().split('\n').map(JSON.parse);
        expect(transactions.length).toBe(1);

        const tx = transactions[0];
        expect(tx.cloudProvider).toBe('azure');
        expect(tx.marketplaceSku).toBe('AZ-FOUNDRY-ALTI-SAAS-109');
        expect(tx.contractId).toBe('az-ea-foundry-3882');
        expect(tx.financials.totalCostUsd).toBeGreaterThan(0);
    });

    it('should route AWS Bedrock prompts to Azure Foundry under Sovereign mode and log Azure Billing', async () => {
        const prompt = 'Use AWS Bedrock to build a custom agent loop.';
        const result = await hybridRouterService.executeAgent(prompt);

        expect(result).toBeDefined();
        expect(result.venue).toBe('AZURE_FOUNDRY_MARKETPLACE');
        expect(result.content).toContain('AZURE FOUNDRY');

        // Verify the Azure marketplace transaction was logged securely
        const logContent = await fs.readFile(testLogPath, 'utf-8');
        const transactions = logContent.trim().split('\n').map(JSON.parse);
        const tx = transactions.find(t => t.cloudProvider === 'azure');
        expect(tx).toBeDefined();
        expect(tx.marketplaceSku).toBe('AZ-FOUNDRY-ALTI-SAAS-109');
        expect(tx.contractId).toBe('az-ea-foundry-3882');
    });

    it('should route Azure prompts to Azure Foundry and log Azure Marketplace Billing', async () => {
        const prompt = 'Route this to Azure Foundry for visual analysis.';
        const result = await hybridRouterService.executeAgent(prompt);

        expect(result).toBeDefined();
        expect(result.venue).toBe('AZURE_FOUNDRY_MARKETPLACE');
        expect(result.content).toContain('AZURE FOUNDRY');

        // Verify the Azure marketplace transaction was logged securely
        const logContent = await fs.readFile(testLogPath, 'utf-8');
        const transactions = logContent.trim().split('\n').map(JSON.parse);
        const tx = transactions.find(t => t.cloudProvider === 'azure');
        expect(tx).toBeDefined();
        expect(tx.marketplaceSku).toBe('AZ-FOUNDRY-ALTI-SAAS-109');
        expect(tx.contractId).toBe('az-ea-foundry-3882');
    });

    it('should accurately aggregate and summarize marketplace procurement metrics solely on Azure', async () => {
        // Execute multiple multi-cloud requests to build history (all will resolve to Azure)
        await multiCloudInferenceService.executeMultiCloudInference('Query 1', 'jules', { preferredProvider: 'gcp' });
        await multiCloudInferenceService.executeMultiCloudInference('Query 2', 'jules', { preferredProvider: 'aws' });
        await multiCloudInferenceService.executeMultiCloudInference('Query 3', 'jules', { preferredProvider: 'azure' });

        const stats = await multiCloudInferenceService.getMarketplaceProcurementStats();

        expect(stats).toBeDefined();
        expect(stats.azure.transactionCount).toBe(3);
        expect(stats.global.totalTransactions).toBe(3);
        expect(stats.global.totalBilledUsd).toBeGreaterThan(0);
        expect(stats.global.totalTokens).toBeGreaterThan(0);
    });
});
