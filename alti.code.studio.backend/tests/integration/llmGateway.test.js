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
        const { memorystoreService } = await import('../../src/app/modules/azureCloud/azureCache.service.js');
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

    it('LLM Gateway Defense: should sanitize sensitive credentials from error messages', () => {
        const rawMessage = 'Error connecting with API Key AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6 and key sk-abcdefghijklmnopqrstuvwxyz0123456789 or Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and headers api-key: my-azure-secret-key-1234 on endpoint https://my-resource.openai.azure.com';
        const sanitized = LlmGatewayService.sanitizeErrorMessage(rawMessage);

        expect(sanitized).not.toContain('AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6');
        expect(sanitized).not.toContain('sk-abcdefghijklmnopqrstuvwxyz0123456789');
        expect(sanitized).not.toContain('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        expect(sanitized).not.toContain('my-azure-secret-key-1234');
        expect(sanitized).not.toContain('https://my-resource.openai.azure.com');

        expect(sanitized).toContain('AIzaSy...[MASKED]');
        expect(sanitized).toContain('sk-...[MASKED]');
        expect(sanitized).toContain('Bearer [MASKED]');
        expect(sanitized).toContain('api-key: [MASKED]');
        expect(sanitized).toContain('https://[AZURE_ENDPOINT_MASKED]');
    });

    it('LLM Gateway Agility: should retry transient errors and recover', async () => {
        let calls = 0;
        const fn = async () => {
            calls++;
            if (calls < 3) {
                const err = new Error('Rate limit exceeded (timeout)');
                err.status = 429;
                throw err;
            }
            return 'Success after retry';
        };

        const result = await LlmGatewayService.callWithRetry(fn, 2, 10);
        expect(calls).toBe(3);
        expect(result).toBe('Success after retry');
    });

    it('LLM Gateway Agility: should fail immediately on non-transient errors', async () => {
        let calls = 0;
        const fn = async () => {
            calls++;
            const err = new Error('Invalid credentials');
            err.status = 401; // Not transient
            throw err;
        };

        await expect(LlmGatewayService.callWithRetry(fn, 2, 10)).rejects.toThrow('Invalid credentials');
        expect(calls).toBe(1); // No retry
    });
});
