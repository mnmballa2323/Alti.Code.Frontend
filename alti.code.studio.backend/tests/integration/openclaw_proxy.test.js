import { test, expect, vi } from 'vitest';
import { openclawProxyService } from '../../src/app/modules/openclaw/openclaw.proxy.service.js';
import { openClawAgent } from '../../src/app/modules/agents/openclaw.agent.js';
import * as https from 'https';
import { EventEmitter } from 'events';

vi.mock('https');

// Mock Gemini to avoid actual LLM calls and CircuitBreaker failures
vi.mock('../../src/app/modules/gemini/gemini.service.js', () => {
    return {
        GeminiAiService: {
            generateContent: vi.fn().mockResolvedValue('Open the Chrome browser, navigate to GitHub.')
        }
    };
});

// Mock the proxy service entirely so the agent uses the mocked version
vi.mock('../../src/app/modules/openclaw/openclaw.proxy.service.js', () => ({
    openclawProxyService: {
        delegateToLocalHost: vi.fn().mockResolvedValue("Mocked physical host browser automation finished.")
    }
}));

test('OpenClaw Proxy Tunnel: Delegation and Telemetry Wrapping', async () => {
    // 2. Invoke the agent via its BaseSpecialistAgent wrapper
    const result = await openClawAgent.consult("Open a browser and navigate to GitHub");

    // 3. Asset Telemetry structure
    expect(result).toHaveProperty('agent', 'OpenClawAgent');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('type', 'text');
    expect(result).toHaveProperty('content');
    expect(result.content).toContain('[OPENCLAW SURROGATE LOCAL EXECUTION]');
    expect(result.content).toContain('Mocked physical host browser automation finished.');
});
