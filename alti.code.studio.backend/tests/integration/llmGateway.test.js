global.self = global;
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { vi } from 'vitest';

const mockVaults = new Map();
const mockChatHistories = new Map();
const mockUsers = new Map();

vi.mock('../../src/config/prisma.js', () => {
    return {
        prisma: {
            user: {
                upsert: vi.fn().mockImplementation(async ({ where, create }) => {
                    const email = where.email;
                    const user = { id: create.id, email, role: create.role };
                    mockUsers.set(create.id, user);
                    return user;
                }),
                findUnique: vi.fn().mockImplementation(async ({ where }) => {
                    return mockUsers.get(where.id) || null;
                })
            },
            vault: {
                findUnique: vi.fn().mockImplementation(async ({ where }) => {
                    return mockVaults.get(where.userId) || null;
                }),
                upsert: vi.fn().mockImplementation(async ({ where, create, update }) => {
                    const userId = where.userId;
                    const existing = mockVaults.get(userId);
                    const record = existing ? { ...existing, ...update } : { userId, ...create };
                    mockVaults.set(userId, record);
                    return record;
                })
            },
            chatHistory: {
                findFirst: vi.fn().mockImplementation(async ({ where }) => {
                    const userId = where.userId;
                    const sessionId = where.sessionId;
                    for (const chat of mockChatHistories.values()) {
                        if (chat.userId === userId && chat.sessionId === sessionId) {
                            return chat;
                        }
                    }
                    return null;
                }),
                create: vi.fn().mockImplementation(async ({ data }) => {
                    const id = 'mock-chat-id-' + Math.random();
                    const record = { id, ...data };
                    mockChatHistories.set(id, record);
                    return record;
                }),
                update: vi.fn().mockImplementation(async ({ where, data }) => {
                    let record = null;
                    if (where.id) {
                        record = mockChatHistories.get(where.id);
                    } else {
                        for (const chat of mockChatHistories.values()) {
                            if (chat.userId === where.userId && chat.sessionId === where.sessionId) {
                                record = chat;
                                break;
                            }
                        }
                    }
                    if (record) {
                        Object.assign(record, data);
                    }
                    return record;
                })
            },
            $disconnect: vi.fn()
        },
        getTenantPrisma: vi.fn(),
        connectPrisma: vi.fn()
    };
});

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
        try {
            await prisma.user.upsert({
                where: { email: 'test-vault@alti.code.studio' },
                update: {},
                create: {
                    id: testUserId,
                    email: 'test-vault@alti.code.studio',
                    role: 'admin'
                }
            });
        } catch (err) {
            console.warn('⚠️ PostgreSQL database is offline. Vault test will execute under secure memory-based fallback state.');
        }
    });

    afterAll(async () => {
        // Disconnect clients to prevent process hanging
        const { memorystoreService } = await import('../../src/app/modules/gcpCloud/gcpCache.service.js');
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
            partnerApiKey: 'sk-partner-key-secret-123456',
            gcpEndpoint: 'https://alti-gcp-foundry.partner.gcp.com/',
            gcpApiKey: 'gcp-secret-key-654321',
            gcpProjectId: 'alti-secure-enterprise-project'
        };

        // Save keys - must encrypt at-rest
        const maskedOutput = await VaultService.updateCredentials(testUserId, testKeys);

        expect(maskedOutput.partnerApiKey).toContain('sk-');
        expect(maskedOutput.partnerApiKey).toContain('...3456');
        expect(maskedOutput.gcpApiKey).toContain('gcp');
        expect(maskedOutput.gcpApiKey).toContain('...4321');
        expect(maskedOutput.gcpEndpoint).toBe('https://alti-gcp-foundry.partner.gcp.com/');
        expect(maskedOutput.gcpProjectId).toBe('alti-secure-enterprise-project');

        // Confirm DB ciphertext is NOT plaintext (is encrypted)
        const dbRecord = await prisma.vault.findUnique({
            where: { userId: testUserId }
        });
        expect(dbRecord.partnerApiKey).not.toBe(testKeys.partnerApiKey);
        expect(dbRecord.gcpApiKey).not.toBe(testKeys.gcpApiKey);

        // Fetch decrypted raw keys in-memory
        const rawKeys = await VaultService.getRawCredentials(testUserId);
        expect(rawKeys.partnerApiKey).toBe(testKeys.partnerApiKey);
        expect(rawKeys.gcpApiKey).toBe(testKeys.gcpApiKey);
        expect(rawKeys.gcpEndpoint).toBe(testKeys.gcpEndpoint);
    });

        // Mock gateway execution
        const prompt = 'Test unified credentials loading';
        const model = 'gemini-2.5-pro';

        // Should load secure vault credentials dynamically in-memory and decrypt them.
        const rawCreds = await VaultService.getRawCredentials(testUserId);
        expect(rawCreds.partnerApiKey).toBe('sk-partner-key-secret-123456');

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
        const rawMessage = 'Error connecting with API Key AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6 and key sk-abcdefghijklmnopqrstuvwxyz0123456789 or Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and headers api-key: my-gcp-secret-key-1234 on endpoint https://my-resource.openai.gcp.com';
        const sanitized = LlmGatewayService.sanitizeErrorMessage(rawMessage);

        expect(sanitized).not.toContain('AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6');
        expect(sanitized).not.toContain('sk-abcdefghijklmnopqrstuvwxyz0123456789');
        expect(sanitized).not.toContain('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        expect(sanitized).not.toContain('my-gcp-secret-key-1234');
        expect(sanitized).not.toContain('https://my-resource.openai.gcp.com');

        expect(sanitized).toContain('AIzaSy...[MASKED]');
        expect(sanitized).toContain('sk-...[MASKED]');
        expect(sanitized).toContain('Bearer [MASKED]');
        expect(sanitized).toContain('api-key: [MASKED]');
        expect(sanitized).toContain('https://[GCP_ENDPOINT_MASKED]');
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
