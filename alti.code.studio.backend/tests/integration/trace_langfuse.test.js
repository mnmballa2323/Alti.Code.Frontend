import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Global spies for test assertions
const mockTraceUpdate = vi.fn();
const mockTraceGeneration = vi.fn();
const mockSpanEnd = vi.fn();
const mockSpanGeneration = vi.fn();

const mockTraceFn = vi.fn().mockImplementation(() => ({
  update: mockTraceUpdate,
  generation: mockTraceGeneration
}));

const mockSpanFn = vi.fn().mockImplementation(() => ({
  end: mockSpanEnd,
  generation: mockSpanGeneration
}));

// Mock the Langfuse SDK using a class constructor
vi.mock('langfuse', () => {
  return {
    Langfuse: class {
      constructor() {
        this.trace = mockTraceFn;
        this.span = mockSpanFn;
      }
    }
  };
});

describe('Swarm Telemetry Langfuse Tracing Integration Tests', () => {
  let originalPublicKey;
  let originalSecretKey;

  beforeEach(() => {
    vi.clearAllMocks();
    originalPublicKey = process.env.LANGFUSE_PUBLIC_KEY;
    originalSecretKey = process.env.LANGFUSE_SECRET_KEY;
  });

  afterEach(() => {
    process.env.LANGFUSE_PUBLIC_KEY = originalPublicKey;
    process.env.LANGFUSE_SECRET_KEY = originalSecretKey;
  });

  it('should initialize Langfuse client if API keys are set', async () => {
    process.env.LANGFUSE_PUBLIC_KEY = 'pk-test';
    process.env.LANGFUSE_SECRET_KEY = 'sk-test';

    const { SwarmTraceService } = await import('../../src/app/modules/telemetry/trace.service.js');
    const customTraceService = new SwarmTraceService();

    expect(customTraceService.langfuse).toBeDefined();
    expect(customTraceService.langfuse.trace).toBe(mockTraceFn);
  });

  it('should correctly capture root span and child span links in Langfuse', async () => {
    process.env.LANGFUSE_PUBLIC_KEY = 'pk-test';
    process.env.LANGFUSE_SECRET_KEY = 'sk-test';
    
    const { SwarmTraceService } = await import('../../src/app/modules/telemetry/trace.service.js');
    const testTraceService = new SwarmTraceService();

    // 1. Start root span
    const rootSpanId = await testTraceService.startSpan('architect', null, 'tenant-1', 'Initialize system design');
    expect(rootSpanId).toBeDefined();
    expect(mockTraceFn).toHaveBeenCalledWith({
      id: rootSpanId,
      name: 'architect',
      userId: 'tenant-1',
      input: 'Initialize system design'
    });

    // 2. Start child span
    const childSpanId = await testTraceService.startSpan('linter', rootSpanId, 'tenant-1', 'Lint directory');
    expect(childSpanId).toBeDefined();
    expect(mockSpanFn).toHaveBeenCalledWith({
      id: childSpanId,
      traceId: rootSpanId,
      parentSpanId: rootSpanId,
      name: 'linter',
      input: 'Lint directory'
    });

    // 3. End child span
    await testTraceService.endSpan(childSpanId, 150, 0.002, { content: 'Lint completed' });
    expect(mockSpanEnd).toHaveBeenCalled();
    
    // 4. End root span
    await testTraceService.endSpan(rootSpanId, 1000, 0.012, { content: 'Architect design done' });
    expect(mockTraceUpdate).toHaveBeenCalled();
  });

  it('should record generation nodes under active spans', async () => {
    process.env.LANGFUSE_PUBLIC_KEY = 'pk-test';
    process.env.LANGFUSE_SECRET_KEY = 'sk-test';
    
    const { SwarmTraceService } = await import('../../src/app/modules/telemetry/trace.service.js');
    const testTraceService = new SwarmTraceService();

    const spanId = await testTraceService.startSpan('jules', null, 'tenant-1', 'Help me write code');

    testTraceService.recordGeneration(spanId, {
      name: 'jules_llm_call',
      model: 'gemini-3.1-pro',
      input: 'Help me write code',
      output: 'const x = 5;',
      provider: 'gcp',
      latencyMs: 1200,
      usage: { prompt: 15, completion: 5 }
    });

    expect(mockTraceGeneration).toHaveBeenCalledWith({
      name: 'jules_llm_call',
      model: 'gemini-3.1-pro',
      input: 'Help me write code',
      output: 'const x = 5;',
      metadata: { provider: 'gcp', latencyMs: 1200 },
      usage: { promptTokens: 15, completionTokens: 5 }
    });
  });
});
