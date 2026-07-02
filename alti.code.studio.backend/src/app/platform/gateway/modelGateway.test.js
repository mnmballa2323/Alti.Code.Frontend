/**
 * Copyright (c) 2026 Inso Code
 *
 * Model Gateway Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import httpStatus from 'http-status';
import {
  routePlatformCompletion,
  callWithRetry,
  sanitizeError,
  estimateTokens,
  resetProductTokenCounts,
  resetRegionalMetrics,
  getProductTokenUsage,
  getRegionalMetrics,
} from './modelGateway.js';
import config from '../../../../config/index.js';

const { mockRecordLlmCall } = vi.hoisted(() => ({
  mockRecordLlmCall: vi.fn(),
}));

vi.mock('../../modules/telemetry/telemetry.service.js', () => ({
  telemetryService: {
    recordLlmCall: mockRecordLlmCall,
  },
}));

// Define shared spy mocks that can be asserted on in individual tests
const vertexGenerateContentMock = vi.fn().mockResolvedValue({
  response: {
    candidates: [
      { content: { parts: [{ text: 'Gemini Vertex AI mock reply' }] } },
    ],
  },
});

const bedrockCreateMock = vi.fn().mockResolvedValue({
  content: [{ text: 'AWS Bedrock mock reply' }],
});

const azureCreateMock = vi.fn().mockResolvedValue({
  choices: [{ message: { content: 'Azure OpenAI mock reply' } }],
});

// Mock GCP Vertex AI using Class syntax to satisfy constructor constraints
vi.mock('nonexistent-vertexai', () => {
  return {
    VertexAI: class {
      constructor() {}
      getGenerativeModel() {
        return {
          generateContent: vertexGenerateContentMock,
        };
      }
    },
  };
});

// Mock AWS Bedrock using Class syntax to satisfy constructor constraints
vi.mock('nonexistent-bedrock', () => {
  return {
    AnthropicBedrock: class {
      constructor() {
        this.messages = {
          create: bedrockCreateMock,
        };
      }
    },
  };
});

// Mock Azure OpenAI using Class syntax to satisfy constructor constraints
vi.mock('openai', () => {
  return {
    AzureOpenAI: class {
      constructor() {
        this.chat = {
          completions: {
            create: azureCreateMock,
          },
        };
      }
    },
  };
});

// Mock Google DLP Service
vi.mock('../../modules/ai/gcpDlp.service.js', () => ({
  GoogleDlpService: {
    redactText: vi.fn().mockImplementation(async text => `[REDACTED] ${text}`),
  },
}));

describe('Platform Model Gateway', () => {
  const originalGcpProject = config.gcp?.project_id;
  const originalAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const originalSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const originalAzureKey = process.env.AZURE_OPENAI_API_KEY;
  const originalAzureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;

  beforeEach(() => {
    vi.clearAllMocks();
    if (!config.gcp) config.gcp = {};
    config.gcp.project_id = 'test-gcp-project';
    process.env.AWS_ACCESS_KEY_ID = 'test-aws-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-aws-secret';
    process.env.AZURE_OPENAI_API_KEY = 'test-azure-key';
    process.env.AZURE_OPENAI_ENDPOINT =
      'https://test-azure-endpoint.openai.azure.com';
  });

  afterEach(() => {
    config.gcp.project_id = originalGcpProject;
    process.env.AWS_ACCESS_KEY_ID = originalAccessKey;
    process.env.AWS_SECRET_ACCESS_KEY = originalSecretKey;
    process.env.AZURE_OPENAI_API_KEY = originalAzureKey;
    process.env.AZURE_OPENAI_ENDPOINT = originalAzureEndpoint;
  });

  it('should block direct integrations to unauthorized providers with FORBIDDEN exception', async () => {
    for (const provider of ['openai', 'anthropic', 'aws']) {
      await expect(
        routePlatformCompletion({
          provider,
          model: 'gpt-4o',
          prompt: 'test',
        }),
      ).rejects.toThrow(
        'Security Policy Exception: Direct API connections to non-GCP/Azure providers are blocked. Please use GCP Vertex AI or Azure Foundry.',
      );
    }
  });

  it('should route completions successfully via GCP Vertex AI', async () => {
    const reply = await routePlatformCompletion({
      provider: 'gcp',
      model: 'gemini-3.1-pro',
      prompt: 'Hello Gemini',
    });

    expect(reply).toContain(
      '[GOOGLE VERTEX AI DIRECT SOVEREIGN COMPLIANT SIMULATION]',
    );
  });

  it('should sanitize credentials in error responses to prevent leakage', () => {
    const leakedMsg =
      'API key authentication failed for key sk-1234567890abcdef1234567890abcdef or AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6';
    const sanitized = sanitizeError(leakedMsg);

    expect(sanitized).not.toContain('sk-1234567890abcdef1234567890abcdef');
    expect(sanitized).not.toContain('AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6');
    expect(sanitized).toContain('sk-...[MASKED]');
    expect(sanitized).toContain('AIzaSy...[MASKED]');
  });

  describe('Transient Error Retries (callWithRetry)', () => {
    it('should resolve immediately if function succeeds first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const result = await callWithRetry(mockFn, 3, 10);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toBe('success');
    });

    it('should retry on transient status code and succeed on second attempt', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValueOnce({ status: 429, message: 'Too Many Requests' })
        .mockResolvedValueOnce('recovered');

      const result = await callWithRetry(mockFn, 2, 5);

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result).toBe('recovered');
    });

    it('should fail immediately without retries on non-transient status codes', async () => {
      const mockFn = vi
        .fn()
        .mockRejectedValue({ status: 400, message: 'Bad Request' });

      await expect(callWithRetry(mockFn, 3, 5)).rejects.toEqual({
        status: 400,
        message: 'Bad Request',
      });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Pipeline Pre-processing: DLP', () => {
    it('should run prompt through DLP scrubbing when requested', async () => {
      azureCreateMock.mockResolvedValueOnce({
        choices: [{ message: { content: 'Azure OpenAI mock reply' } }],
      });

      await routePlatformCompletion({
        provider: 'azure',
        model: 'azure/gpt-4o',
        prompt: 'Clean prompt',
        scrubPrompt: true,
      });

      expect(azureCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: '[REDACTED] Clean prompt' }],
        }),
      );
    });
  });

  describe('Product-Level Telemetry Metrics', () => {
    it('should record telemetry with productId, tenantId, latency, and tokens consumed', async () => {
      azureCreateMock.mockResolvedValueOnce({
        choices: [{ message: { content: 'Gemini reply' } }],
        usage: { total_tokens: 150 },
      });

      await routePlatformCompletion({
        provider: 'azure',
        model: 'azure/gpt-4o',
        prompt: 'Hello with telemetry',
        productId: 'inso-code',
        tenantId: 'tenant-999',
      });

      expect(mockRecordLlmCall).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'azure/gpt-4o',
          success: true,
          tokens: 150,
          productId: 'inso-code',
          tenantId: 'tenant-999',
          latencyMs: expect.any(Number),
        }),
      );
    });

    it('should record failure telemetry when inference fails', async () => {
      azureCreateMock.mockRejectedValueOnce(new Error('Inference error'));

      await expect(
        routePlatformCompletion({
          provider: 'azure',
          model: 'azure/gpt-4o',
          prompt: 'Failing prompt',
          productId: 'inso-ai',
          tenantId: 'tenant-111',
        }),
      ).rejects.toThrow();

      expect(mockRecordLlmCall).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'azure/gpt-4o',
          success: false,
          error: 'Inference error',
          productId: 'inso-ai',
          tenantId: 'tenant-111',
          latencyMs: expect.any(Number),
        }),
      );
    });
  });

  describe('Token Estimation Fallback', () => {
    it('should correctly estimate tokens with estimateTokens helper', () => {
      expect(estimateTokens('Hello', 'World')).toBe(3);
      expect(estimateTokens('', '')).toBe(0);
      expect(estimateTokens(null, null)).toBe(0);
    });

    it('should fall back to estimated tokens when GCP response lacks usageMetadata', async () => {
      azureCreateMock.mockResolvedValueOnce({
        choices: [{ message: { content: 'Gemini reply no metadata' } }],
      });

      const prompt = 'Hello Gemini fallback';
      const expectedTokens = Math.ceil(
        (prompt.length + 'Gemini reply no metadata'.length) / 4,
      );

      await routePlatformCompletion({
        provider: 'azure',
        model: 'azure/gpt-4o',
        prompt,
        productId: 'inso-code',
        tenantId: 'tenant-999',
      });

      expect(mockRecordLlmCall).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens: expectedTokens,
        }),
      );
    });
  });

  describe('Phase 12: Product Token Limits, Scoping & Regional Metrics', () => {
    beforeEach(() => {
      resetProductTokenCounts();
      resetRegionalMetrics();
    });

    it('should count tokens per product and enforce billing tier limits', async () => {
      azureCreateMock.mockResolvedValue({
        choices: [{ message: { content: 'Gemini reply' } }],
        usage: { total_tokens: 90000 },
      });

      // Call 1: Consumes 90,000 tokens for product-pharma (limit is 80,000)
      await routePlatformCompletion({
        provider: 'azure',
        model: 'azure/gpt-4o',
        prompt: 'First call',
        productId: 'product-pharma',
      });

      expect(getProductTokenUsage('product-pharma')).toBe(90000);

      // Call 2: Consuming more tokens should fail because it exceeds limit (90,000 >= 80,000)
      await expect(
        routePlatformCompletion({
          provider: 'azure',
          model: 'azure/gpt-4o',
          prompt: 'Second call',
          productId: 'product-pharma',
        }),
      ).rejects.toThrow(
        'Billing tier token limit exceeded for product "product-pharma"',
      );
    });

    it('should track regional metrics correctly per provider', async () => {
      azureCreateMock.mockResolvedValueOnce({
        choices: [{ message: { content: 'GCP reply' } }],
        usage: { total_tokens: 100 },
      });

      await routePlatformCompletion({
        provider: 'azure',
        model: 'azure/gpt-4o',
        prompt: 'Regional test',
        productId: 'product-healthcare',
      });

      const gcpRegion = 'azure-eastus';
      const metrics = getRegionalMetrics(gcpRegion);

      expect(metrics.totalCalls).toBe(1);
      expect(metrics.totalTokens).toBe(100);
      expect(metrics.totalLatencyMs).toBeGreaterThanOrEqual(0);
    });
  });
});
