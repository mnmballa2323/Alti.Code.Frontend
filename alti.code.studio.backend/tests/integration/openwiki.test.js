import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleChatCompletions } from '../../src/app/modules/ai/openwiki.route.js';
import { routePlatformCompletion } from '../../src/app/platform/gateway/modelGateway.js';

// Mock model gateway router completions
vi.mock('../../src/app/platform/gateway/modelGateway.js', () => ({
  routePlatformCompletion: vi.fn(),
}));

describe('OpenWiki Local Proxy Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.OPENWIKI_PROVIDER;
    delete process.env.OPENWIKI_MODEL;
  });

  it('should return 400 Bad Request if messages array is missing or invalid', async () => {
    const mockReq = { body: {} };
    let statusCaptured = null;
    let jsonCaptured = null;

    const mockRes = {
      status: (code) => {
        statusCaptured = code;
        return mockRes;
      },
      json: (data) => {
        jsonCaptured = data;
        return mockRes;
      },
    };

    await handleChatCompletions(mockReq, mockRes);

    expect(statusCaptured).toBe(400);
    expect(jsonCaptured).toEqual({ error: 'Invalid payload: messages array is required.' });
  });

  it('should format messages correctly and forward to routePlatformCompletion using GCP default', async () => {
    vi.mocked(routePlatformCompletion).mockResolvedValue('Here is a mock wiki page content.');

    const mockReq = {
      body: {
        messages: [
          { role: 'system', content: 'You are a writer.' },
          { role: 'user', content: 'Describe this repo.' },
        ],
        temperature: 0.3,
        stream: false,
      },
    };

    let statusCaptured = null;
    let jsonCaptured = null;

    const mockRes = {
      status: (code) => {
        statusCaptured = code;
        return mockRes;
      },
      json: (data) => {
        jsonCaptured = data;
        return mockRes;
      },
    };

    await handleChatCompletions(mockReq, mockRes);

    // Verify correct forwarding parameters
    expect(routePlatformCompletion).toHaveBeenCalledWith({
      provider: 'gcp',
      model: 'gemini-3.5-flash',
      prompt: '[SYSTEM]: You are a writer.\n\n[USER]: Describe this repo.',
      temperature: 0.3,
    });

    // Verify response structure matches standard OpenAI format
    expect(jsonCaptured).toBeDefined();
    expect(jsonCaptured.choices[0].message.content).toBe('Here is a mock wiki page content.');
    expect(jsonCaptured.choices[0].finish_reason).toBe('stop');
    expect(jsonCaptured.usage).toBeDefined();
    expect(jsonCaptured.usage.prompt_tokens).toBeGreaterThan(0);
    expect(jsonCaptured.usage.completion_tokens).toBeGreaterThan(0);
  });

  it('should route to Azure OpenAI when OPENWIKI_PROVIDER is set to azure', async () => {
    vi.mocked(routePlatformCompletion).mockResolvedValue('Azure mock answer.');
    process.env.OPENWIKI_PROVIDER = 'azure';

    const mockReq = {
      body: {
        messages: [{ role: 'user', content: 'Hello' }],
        stream: false,
      },
    };

    let jsonCaptured = null;
    const mockRes = {
      json: (data) => {
        jsonCaptured = data;
        return mockRes;
      },
    };

    await handleChatCompletions(mockReq, mockRes);

    expect(routePlatformCompletion).toHaveBeenCalledWith({
      provider: 'azure',
      model: 'azure/gpt-4o',
      prompt: '[USER]: Hello',
      temperature: 0.2, // Default temperature
    });

    expect(jsonCaptured.choices[0].message.content).toBe('Azure mock answer.');
  });

  it('should support streaming and yield server-sent events chunked chunks', async () => {
    vi.mocked(routePlatformCompletion).mockResolvedValue('Mocked Stream.');

    const mockReq = {
      body: {
        messages: [{ role: 'user', content: 'Hello Stream' }],
        stream: true,
      },
    };

    let headersCaptured = null;
    const writes = [];
    let endCalled = false;

    const mockRes = {
      writeHead: (status, headers) => {
        headersCaptured = headers;
        return mockRes;
      },
      write: (data) => {
        writes.push(data);
        return true;
      },
      end: () => {
        endCalled = true;
      },
    };

    await handleChatCompletions(mockReq, mockRes);

    // Verify SSE headers
    expect(headersCaptured).toBeDefined();
    expect(headersCaptured['Content-Type']).toBe('text/event-stream');

    // Verify chunk progression
    expect(writes.length).toBeGreaterThan(1);
    expect(writes[writes.length - 1]).toContain('[DONE]');
    expect(endCalled).toBe(true);
  });
});
