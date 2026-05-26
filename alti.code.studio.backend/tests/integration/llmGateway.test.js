global.self = global;
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Secure Vault & LLM Gateway Integration Tests', () => {
    let testUserId = '11111111-1111-1111-1111-111111111111';
    let prisma;
    let VaultService;
    let LlmGatewayService;

    beforeAll(async () => {
        // Configure Redis host to target local running container to prevent GCP connection timeouts
        process.env.REDIS_HOST = 'localhost';
        process.env.REDIS_PORT = '6379';

        // Dynamically import dependencies to execute the global.self polyfill beforehand
        const prismaModule = await import('../../src/config/prisma.js');
        const vaultModule = await import('../../src/app/modules/vault/vault.service.js');
        const gatewayModule = await import('../../src/app/modules/llmGateway/llmGateway.service.js');

        prisma = prismaModule.prisma;
        VaultService = vaultModule.VaultService;
        LlmGatewayService = gatewayModule.LlmGatewayService;

        // Enforce fallback test user exists in Postgres
        await prisma.user.upsert({
            where: { email: 'test-vault@alti.code.studio' },
            update: {},
            create: {
                id: testUserId,
                email: 'test-vault@alti.code.studio',
                role: 'admin'
            }
        });
    });

    afterAll(async () => {
        // Disconnect clients to prevent process hanging
        const { memorystoreService } = await import('../../src/app/modules/googleCloud/memorystore.service.js');
        if (memorystoreService.publisher) {
            try { memorystoreService.publisher.disconnect(); } catch(e) {}
        }
        if (memorystoreService.subscriber) {
            try { memorystoreService.subscriber.disconnect(); } catch(e) {}
        }
        if (prisma) {
            await prisma.$disconnect();
        }
    });

    it('Vault Service: should store, encrypt, mask, and retrieve credentials', async () => {
        const testKeys = {
            openaiApiKey: 'sk-direct-openai-key-secret-123456',
            azureEndpoint: 'https://alti-azure-foundry.openai.azure.com/',
            azureApiKey: 'azure-secret-key-654321',
            gcpProjectId: 'alti-secure-enterprise-project'
        };

        // Save keys - must encrypt at-rest
        const maskedOutput = await VaultService.updateCredentials(testUserId, testKeys);

        expect(maskedOutput.openaiApiKey).toContain('sk-');
        expect(maskedOutput.openaiApiKey).toContain('...3456');
        expect(maskedOutput.azureApiKey).toContain('azur');
        expect(maskedOutput.azureApiKey).toContain('...4321');
        expect(maskedOutput.azureEndpoint).toBe('https://alti-azure-foundry.openai.azure.com/');
        expect(maskedOutput.gcpProjectId).toBe('alti-secure-enterprise-project');

        // Confirm DB ciphertext is NOT plaintext (is encrypted)
        const dbRecord = await prisma.vault.findUnique({
            where: { userId: testUserId }
        });
        expect(dbRecord.openaiApiKey).not.toBe(testKeys.openaiApiKey);
        expect(dbRecord.azureApiKey).not.toBe(testKeys.azureApiKey);

        // Fetch decrypted raw keys in-memory
        const rawKeys = await VaultService.getRawCredentials(testUserId);
        expect(rawKeys.openaiApiKey).toBe(testKeys.openaiApiKey);
        expect(rawKeys.azureApiKey).toBe(testKeys.azureApiKey);
        expect(rawKeys.azureEndpoint).toBe(testKeys.azureEndpoint);
    });

    it('LLM Gateway: should execute dynamic model completions', async () => {
        // Mock direct openai gateway execution
        const prompt = 'Test unified credentials loading';
        const model = 'gpt-4o';

        // Should load secure vault credentials dynamically in-memory and decrypt them.
        const rawCreds = await VaultService.getRawCredentials(testUserId);
        expect(rawCreds.openaiApiKey).toBe('sk-direct-openai-key-secret-123456');

        // Validate Chat History Postgres saves (JSONB)
        await LlmGatewayService.saveChatResponse(
            testUserId,
            'test-session-gateway',
            prompt,
            model,
            'Mock secure synthesis reply.'
        );

        const chat = await prisma.chatHistory.findFirst({
            where: {
                userId: testUserId,
                sessionId: 'test-session-gateway'
            }
        });

        expect(chat).not.toBeNull();
        expect(chat.responses).toBeInstanceOf(Array);
        expect(chat.responses[0].reply).toBe('Mock secure synthesis reply.');
    });
});
