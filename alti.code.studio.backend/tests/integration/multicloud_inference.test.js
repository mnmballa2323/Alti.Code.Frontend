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

    it('should successfully execute primary inference on Google Cloud (Vertex) and log GCP Marketplace Billing', async () => {
        const prompt = 'Design a scalable multi-cloud microservices architecture.';
        const result = await multiCloudInferenceService.executeMultiCloudInference(prompt, 'jules', {
            preferredProvider: 'gcp',
            modelId: 'gemini-3.1-pro'
        });

        expect(result).toBeDefined();
        expect(result.provider).toBe('gcp');
        expect(result.venue).toBe('GOOGLE_CLOUD_VERTEX');
        expect(result.content).toBeDefined();

        // Verify the GCP marketplace transaction was logged securely
        const logContent = await fs.readFile(testLogPath, 'utf-8');
        const transactions = logContent.trim().split('\n').map(JSON.parse);
        expect(transactions.length).toBe(1);

        const tx = transactions[0];
        expect(tx.cloudProvider).toBe('gcp');
        expect(tx.marketplaceSku).toBe('GCP-MKT-ALTI-SWARM-001');
        expect(tx.contractId).toBe('gcp-contract-7718');
        expect(tx.financials.totalCostUsd).toBeGreaterThan(0);
    });

    it('should fall back to AWS Bedrock and log AWS Marketplace Billing when requested in the prompt', async () => {
        const prompt = 'Use AWS Bedrock to build a custom agent loop.';
        const result = await hybridRouterService.executeAgent(prompt);

        expect(result).toBeDefined();
        expect(result.venue).toBe('AWS_BEDROCK_MARKETPLACE');
        expect(result.content).toContain('AWS BEDROCK');

        // Verify the AWS marketplace transaction was logged securely
        const logContent = await fs.readFile(testLogPath, 'utf-8');
        const transactions = logContent.trim().split('\n').map(JSON.parse);
        const tx = transactions.find(t => t.cloudProvider === 'aws');
        expect(tx).toBeDefined();
        expect(tx.marketplaceSku).toBe('AWS-MP-ALTI-BEDROCK-042');
        expect(tx.contractId).toBe('aws-ent-bedrock-4912');
    });

    it('should fall back to Azure Foundry and log Azure Marketplace Billing when requested in the prompt', async () => {
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

    it('should accurately aggregate and summarize marketplace procurement metrics across all providers', async () => {
        // Execute multiple multi-cloud requests to build history
        await multiCloudInferenceService.executeMultiCloudInference('Query 1', 'jules', { preferredProvider: 'gcp' });
        await multiCloudInferenceService.executeMultiCloudInference('Query 2', 'jules', { preferredProvider: 'aws' });
        await multiCloudInferenceService.executeMultiCloudInference('Query 3', 'jules', { preferredProvider: 'azure' });

        const stats = await multiCloudInferenceService.getMarketplaceProcurementStats();

        expect(stats).toBeDefined();
        expect(stats.gcp.transactionCount).toBe(1);
        expect(stats.aws.transactionCount).toBe(1);
        expect(stats.azure.transactionCount).toBe(1);
        expect(stats.global.totalTransactions).toBe(3);
        expect(stats.global.totalBilledUsd).toBeGreaterThan(0);
        expect(stats.global.totalTokens).toBeGreaterThan(0);
    });
});
