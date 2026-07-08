/**
 * Copyright (c) 2026 Inso Code
 *
 * Model Gateway Unit Tests (GCP Sovereign Inference Only)
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

// Mock executeVertexInference
const executeVertexInferenceMock = vi.fn().mockResolvedValue({
  text: 'Google Vertex AI mock reply',
  usage: { promptTokens: 10, completionTokens: 20 },
  provider: 'gcp-vertex',
});

vi.mock('../../modules/ai/vertex_ai.helper.js', () => ({
  executeVertexInference: (...args) => executeVertexInferenceMock(...args),
}));

// Mock Google DLP Service
vi.mock('../../modules/ai/gcpDlp.service.js', () => ({
  GoogleDlpService: {
    redactText: vi.fn().mockImplementation(async text => `[REDACTED] ${text}`),
  },
}));

describe('Platform Model Gateway', () => {
  const originalGcpProject = config.gcp?.project_id;
  const originalGcpLocation = config.gcp?.location;

  beforeEach(() => {
    vi.clearAllMocks();
    if (!config.gcp) config.gcp = {};
    config.gcp.project_id = 'test-gcp-project';
    config.gcp.location = 'us-central1';
  });

  afterEach(() => {
    if (config.gcp) {
      config.gcp.project_id = originalGcpProject;
      config.gcp.location = originalGcpLocation;
    }
  });

  it('should block direct integrations to unauthorized providers with FORBIDDEN exception', async () => {
    for (const provider of ['openai', 'anthropic', 'external']) {
      await expect(
        routePlatformCompletion({
          provider,
          model: 'gpt-4o',
          prompt: 'test',
        }),
      ).rejects.toThrow(
        'Security Policy Exception: Direct API connections to non-GCP providers are blocked. Please use GCP Vertex AI.',
      );
    }
  });

  it('should route completions successfully via GCP Vertex AI', async () => {
    executeVertexInferenceMock.mockResolvedValueOnce({
      text: 'Gemini Vertex AI mock reply',
      usage: { promptTokens: 10, completionTokens: 20 },
      provider: 'gcp-vertex',
    });

    const reply = await routePlatformCompletion({
      provider: 'gcp',
      model: 'gemini-3.1-pro',
      prompt: 'Hello Gemini',
    });

    expect(reply).toBe('Gemini Vertex AI mock reply');
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
      executeVertexInferenceMock.mockResolvedValueOnce({
        text: 'GCP mock reply',
        usage: { promptTokens: 5, completionTokens: 10 },
        provider: 'gcp-vertex',
      });

      await routePlatformCompletion({
        provider: 'gcp',
        model: 'gemini-3.5-pro',
        prompt: 'Clean prompt',
        scrubPrompt: true,
      });

      expect(executeVertexInferenceMock).toHaveBeenCalledWith(
        '[REDACTED] Clean prompt',
        'gemini-3.5-pro',
        expect.any(Object),
      );
    });
  });

  describe('Product-Level Telemetry Metrics', () => {
    it('should record telemetry with productId, tenantId, latency, and tokens consumed', async () => {
      executeVertexInferenceMock.mockResolvedValueOnce({
        text: 'GCP reply',
        usage: { promptTokens: 50, completionTokens: 100 },
        provider: 'gcp-vertex',
      });

      await routePlatformCompletion({
        provider: 'gcp',
        model: 'gemini-3.5-pro',
        prompt: 'Hello with telemetry',
        productId: 'inso-code',
        tenantId: 'tenant-999',
      });

      expect(mockRecordLlmCall).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-3.5-pro',
          success: true,
          tokens: 150,
          productId: 'inso-code',
          tenantId: 'tenant-999',
          latencyMs: expect.any(Number),
        }),
      );
    });

    it('should record failure telemetry when inference fails', async () => {
      executeVertexInferenceMock.mockRejectedValueOnce(new Error('Inference error'));

      await expect(
        routePlatformCompletion({
          provider: 'gcp',
          model: 'gemini-3.5-pro',
          prompt: 'Failing prompt',
          productId: 'inso-ai',
          tenantId: 'tenant-111',
        }),
      ).rejects.toThrow();

      expect(mockRecordLlmCall).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-3.5-pro',
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
      executeVertexInferenceMock.mockResolvedValueOnce({
        text: 'GCP reply no metadata',
        usage: null,
        provider: 'gcp-vertex',
      });

      const prompt = 'Hello GCP fallback';
      const expectedTokens = Math.ceil(
        (prompt.length + 'GCP reply no metadata'.length) / 4,
      );

      await routePlatformCompletion({
        provider: 'gcp',
        model: 'gemini-3.5-pro',
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
      executeVertexInferenceMock.mockResolvedValue({
        text: 'GCP reply',
        usage: { promptTokens: 40000, completionTokens: 50000 },
        provider: 'gcp-vertex',
      });

      // Call 1: Consumes 90,000 tokens for product-pharma (limit is 80,000)
      await routePlatformCompletion({
        provider: 'gcp',
        model: 'gemini-3.5-pro',
        prompt: 'First call',
        productId: 'product-pharma',
      });

      expect(getProductTokenUsage('product-pharma')).toBe(90000);

      // Call 2: Consuming more tokens should fail because it exceeds limit (90,000 >= 80,000)
      await expect(
        routePlatformCompletion({
          provider: 'gcp',
          model: 'gemini-3.5-pro',
          prompt: 'Second call',
          productId: 'product-pharma',
        }),
      ).rejects.toThrow(
        'Billing tier token limit exceeded for product "product-pharma"',
      );
    });

    it('should track regional metrics correctly per provider', async () => {
      executeVertexInferenceMock.mockResolvedValueOnce({
        text: 'GCP reply',
        usage: { promptTokens: 40, completionTokens: 60 },
        provider: 'gcp-vertex',
      });

      await routePlatformCompletion({
        provider: 'gcp',
        model: 'gemini-3.5-pro',
        prompt: 'Regional test',
        productId: 'product-healthcare',
      });

      const gcpRegion = 'us-central1';
      const metrics = getRegionalMetrics(gcpRegion);

      expect(metrics.totalCalls).toBe(1);
      expect(metrics.totalTokens).toBe(100);
      expect(metrics.totalLatencyMs).toBeGreaterThanOrEqual(0);
    });
  });
});
