/**
 * Copyright (c) 2026 Inso Code
 * 
 * Model Gateway Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import httpStatus from 'http-status';
import { routePlatformCompletion, sanitizeError } from './modelGateway.js';
import config from '../../../../config/index.js';

// Mock GCP Vertex AI using Class syntax to satisfy constructor constraints
vi.mock('@google-cloud/vertexai', () => {
  const generateContentMock = vi.fn().mockResolvedValue({
    response: {
      candidates: [{ content: { parts: [{ text: 'Gemini Vertex AI mock reply' }] } }]
    }
  });

  return {
    VertexAI: class {
      constructor() {}
      getGenerativeModel() {
        return {
          generateContent: generateContentMock
        };
      }
    }
  };
});

// Mock AWS Bedrock using Class syntax to satisfy constructor constraints
vi.mock('@anthropic-ai/bedrock-sdk', () => {
  const createMock = vi.fn().mockResolvedValue({
    content: [{ text: 'AWS Bedrock mock reply' }]
  });

  return {
    AnthropicBedrock: class {
      constructor() {
        this.messages = {
          create: createMock
        };
      }
    }
  };
});

// Mock Azure OpenAI using Class syntax to satisfy constructor constraints
vi.mock('openai', () => {
  const createMock = vi.fn().mockResolvedValue({
    choices: [{ message: { content: 'Azure OpenAI mock reply' } }]
  });

  return {
    AzureOpenAI: class {
      constructor() {
        this.chat = {
          completions: {
            create: createMock
          }
        };
      }
    }
  };
});

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
    process.env.AZURE_OPENAI_ENDPOINT = 'https://test-azure-endpoint.openai.azure.com';
  });

  afterEach(() => {
    config.gcp.project_id = originalGcpProject;
    process.env.AWS_ACCESS_KEY_ID = originalAccessKey;
    process.env.AWS_SECRET_ACCESS_KEY = originalSecretKey;
    process.env.AZURE_OPENAI_API_KEY = originalAzureKey;
    process.env.AZURE_OPENAI_ENDPOINT = originalAzureEndpoint;
  });

  it('should block direct integrations to openai or anthropic with FORBIDDEN exception', async () => {
    await expect(
      routePlatformCompletion({ provider: 'openai', model: 'gpt-4o', prompt: 'test' })
    ).rejects.toThrow('Security Policy Exception: Direct API connections to OpenAI and Anthropic are blocked.');

    await expect(
      routePlatformCompletion({ provider: 'anthropic', model: 'claude-3-5-sonnet', prompt: 'test' })
    ).rejects.toThrow('Security Policy Exception: Direct API connections to OpenAI and Anthropic are blocked.');
  });

  it('should route Gemini completions successfully via GCP Vertex AI', async () => {
    const reply = await routePlatformCompletion({
      provider: 'gcp',
      model: 'gemini-3.1-pro',
      prompt: 'Hello Gemini'
    });

    expect(reply).toBe('Gemini Vertex AI mock reply');
  });

  it('should route Claude completions successfully via AWS Bedrock', async () => {
    const reply = await routePlatformCompletion({
      provider: 'aws',
      model: 'claude-3-5-sonnet',
      prompt: 'Hello Claude'
    });

    expect(reply).toBe('AWS Bedrock mock reply');
  });

  it('should route GPT completions successfully via Azure OpenAI Foundry', async () => {
    const reply = await routePlatformCompletion({
      provider: 'azure',
      model: 'azure/gpt-4o',
      prompt: 'Hello GPT'
    });

    expect(reply).toBe('Azure OpenAI mock reply');
  });

  it('should sanitize credentials in error responses to prevent leakage', () => {
    const leakedMsg = 'API key authentication failed for key sk-1234567890abcdef1234567890abcdef or AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6';
    const sanitized = sanitizeError(leakedMsg);

    expect(sanitized).not.toContain('sk-1234567890abcdef1234567890abcdef');
    expect(sanitized).not.toContain('AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6');
    expect(sanitized).toContain('sk-...[MASKED]');
    expect(sanitized).toContain('AIzaSy...[MASKED]');
  });
});
