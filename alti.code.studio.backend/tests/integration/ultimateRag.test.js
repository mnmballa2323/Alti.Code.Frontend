global.self = global;
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

vi.mock('../../src/app/platform/index.js', () => {
    return {
        prisma: {
            user: {
                findUnique: vi.fn().mockResolvedValue({
                    id: 'mock-user-id',
                    email: 'mock@mock.com',
                    tenantId: 'mock-tenant-id',
                    tenant: { customerKmsKeyArn: null }
                })
            },
            vault: {
                findUnique: vi.fn().mockResolvedValue({
                    openaiApiKey: 'encrypted',
                    anthropicApiKey: 'encrypted',
                    geminiApiKey: 'encrypted',
                    gcpProjectId: 'encrypted',
                    gcpClientEmail: 'encrypted',
                    gcpPrivateKey: 'encrypted'
                })
            }
        },
        getTenantPrisma: vi.fn(),
        connectPrisma: vi.fn()
    };
});

vi.mock('../../src/app/modules/ai/multicloud_inference.service.js', () => ({
    multiCloudInferenceService: {
        executeMultiCloudInference: vi.fn()
    }
}));

import { ultimateRagService } from '../../src/app/modules/rag/ultimate_rag.service.js';
import { azureGenAiService as AzureGenAiService } from '../../src/app/modules/ai/azureGenAi.service.js';
import { discoveryEngineService } from '../../src/app/modules/gcpCloud/gcpSearch.service.js';
import { spannerGraphService } from '../../src/app/modules/gcpCloud/gcpSpannerGraph.service.js';
import { GeminiCliService } from '../../src/app/modules/geminiCli/geminiCli.service.js';
import { fileSearchService } from '../../src/app/modules/fileSearch/fileSearch.service.js';
import { ragCacheService } from '../../src/app/modules/gcpCloud/gcpCache.service.js';

vi.mock('../../src/app/modules/ai/azureGenAi.service.js', () => ({
    azureGenAiService: {
        generateContent: vi.fn()
    }
}));

vi.mock('../../src/app/modules/gcpCloud/gcpSearch.service.js', () => ({
    discoveryEngineService: {
        searchCodebase: vi.fn().mockResolvedValue([])
    }
}));

vi.mock('../../src/app/modules/gcpCloud/gcpSpannerGraph.service.js', () => ({
    spannerGraphService: {
        queryArchitectureDependencies: vi.fn().mockResolvedValue([]),
        executeAstGraphTraversal: vi.fn().mockResolvedValue([])
    }
}));

vi.mock('../../src/app/modules/geminiCli/geminiCli.service.js', () => ({
    GeminiCliService: {
        runGeminiCLI: vi.fn().mockResolvedValue('Mock CLI Expertise')
    }
}));

vi.mock('../../src/app/modules/fileSearch/fileSearch.service.js', () => ({
    fileSearchService: {
        listStores: vi.fn().mockResolvedValue([]),
        query: vi.fn().mockResolvedValue({ text: 'Mock File Search Text', citations: [] })
    }
}));



vi.mock('../../src/app/modules/gcpCloud/gcpCache.service.js', () => ({
    ragCacheService: {
        getCachedContext: vi.fn().mockResolvedValue(null),
        setCachedContext: vi.fn().mockResolvedValue(true)
    }
}));

vi.mock('../../src/app/modules/ai/multicloud_inference.service.js', () => ({
    multiCloudInferenceService: {
        executeMultiCloudInference: vi.fn()
    }
}));

vi.mock('../../src/app/modules/memory/vector.store.js', () => ({
    vectorStoreService: {
        add: vi.fn().mockResolvedValue(true)
    }
}));

vi.mock('../../src/config/prisma.js', () => ({
    prisma: {
        user: {
            findFirst: vi.fn().mockResolvedValue({ id: 'mock-user-id' }),
            upsert: vi.fn().mockResolvedValue({ id: 'mock-user-id' }),
            findUnique: vi.fn().mockResolvedValue({
                id: 'mock-user-id',
                email: 'mock@mock.com',
                tenantId: 'mock-tenant-id',
                tenant: { customerKmsKeyArn: null }
            })
        },
        chatHistory: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(true),
            update: vi.fn().mockResolvedValue(true)
        },
        vault: {
            findUnique: vi.fn().mockResolvedValue({
                openaiApiKey: 'mocked-key',
                anthropicApiKey: 'mocked-key',
                geminiApiKey: 'mocked-key',
                azureEndpoint: 'mocked-endpoint',
                azureApiKey: 'mocked-key',
                gcpProjectId: 'mocked-gcp-project',
                gcpClientEmail: 'mocked-email',
                gcpPrivateKey: 'mocked-key',
            })
        }
    }
}));

describe('Ultimate RAG Service - Secure Chat Sandbox Integration Tests', () => {
    beforeAll(() => {
        // Prevent cache hits
        ragCacheService.getCachedContext.mockResolvedValue(null);
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it('should inject Chat Workspace guardrails and block raw code output when domain is "Chat"', async () => {
        let capturedPrompt = '';
        AzureGenAiService.generateContent.mockImplementation(async (prompt, model, temp) => {
            // Capture the main synthesis prompt containing context
            if (prompt.includes('GOOGLE RAG CONTEXT')) {
                capturedPrompt = prompt;
                return { content: 'This is a secure conceptual response explaining the architecture. For coding, please switch to the Code Workspace page.' };
            }
            // Fallback content for query expansion
            return { content: '["query"]' };
        });

        const query = 'How does Alti routing work? Write a route for me.';
        const result = await ultimateRagService.synthesize(query, 'default', 'Chat', 'javascript');

        expect(capturedPrompt).toContain('=== STRICT SYSTEM INSTRUCTIONS FOR ISOLATED CHAT WORKSPACE ===');
        expect(capturedPrompt).toContain('You are operating in the isolated, sandboxed CHAT workspace under RAG codebase search.');
        expect(capturedPrompt).toContain('strictly PROHIBITED from writing, generating, or outputting any raw source code');
        expect(result.synthesis).toBe('This is a secure conceptual response explaining the architecture. For coding, please switch to the Code Workspace page.');
    });

    it('should NOT inject Chat Workspace guardrails when domain is "Full Stack"', async () => {
        let capturedPrompt = '';
        AzureGenAiService.generateContent.mockImplementation(async (prompt, model, temp) => {
            if (prompt.includes('GOOGLE RAG CONTEXT')) {
                capturedPrompt = prompt;
                return { content: 'Here is the code block: ```javascript\nconst express = require("express");\n```' };
            }
            return { content: '["query"]' };
        });

        const query = 'How does Alti routing work? Write a route for me.';
        const result = await ultimateRagService.synthesize(query, 'default', 'Full Stack', 'javascript');

        expect(capturedPrompt).not.toContain('=== STRICT SYSTEM INSTRUCTIONS FOR ISOLATED CHAT WORKSPACE ===');
        expect(result.synthesis).toContain('Here is the code block');
    });

    it('LLM Gateway Agentic Routing: should classify codebase queries as RAG and redirect seamlessly', async () => {
        const { LlmGatewayService } = await import('../../src/app/modules/llmGateway/llmGateway.service.js');
        const { multiCloudInferenceService } = await import('../../src/app/modules/ai/multicloud_inference.service.js');
        
        let classificationRun = false;
        multiCloudInferenceService.executeMultiCloudInference.mockImplementation(async (prompt, agent, options) => {
            if (prompt.includes('requires searching the codebase')) {
                classificationRun = true;
                return { content: 'RAG', model: 'gpt-5.5' };
            }
            return { content: 'mocked content', model: 'gpt-5.5' };
        });

        AzureGenAiService.generateContent.mockImplementation(async (prompt, model, temp) => {
            if (prompt.includes('GOOGLE RAG CONTEXT')) {
                return { content: 'This is the RAG answer explaining architecture conceptually.' };
            }
            return { content: '["query"]' };
        });

        // Trigger routeCompletion with domain === 'Chat'
        const result = await LlmGatewayService.routeCompletion(
            'system_dev_user',
            'test-session-agentic',
            'Explain how Vault service is secure',
            'gemini-3.1-pro',
            0.5,
            'Chat'
        );

        expect(classificationRun).toBe(true);
        expect(result.success).toBe(true);
        expect(result.reply).toBe('This is the RAG answer explaining architecture conceptually.');
    });
});
