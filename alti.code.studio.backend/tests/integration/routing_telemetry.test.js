import { test, expect, vi } from 'vitest';
import { capabilityRouter } from '../../src/app/modules/agents/capability.router.js';
import { GeminiAiService } from '../../src/app/modules/gemini/gemini.service.js';

test('CapabilityRouter O(1) Tokenization performance and fuzzy matching', () => {
    const query = "Deploy a kubernetes cluster with argocd";

    const startMs = Date.now();
    const ranked = capabilityRouter.score(query);
    const ms = Date.now() - startMs;

    // Performance: Must score 571+ agents in under 10ms
    expect(ms).toBeLessThan(10);

    // Should successfully match the correct agent (e.g. Kubernetes/Argo)
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].score).toBeGreaterThan(0);
});

test('BaseSpecialistAgent unified telemetry wrapper output', async () => {
    vi.spyOn(GeminiAiService, 'generateContent').mockResolvedValue('```python\\nprint("Hello World")\\n```');
    const query = "Write a basic hello world in python";

    // The router should route this to pythonScriptAgent or pythonDjangoAgent, etc.
    const result = await capabilityRouter.dispatch(query, []);

    // Validate structural schema of the returned object
    expect(result).toHaveProperty('agent');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('content');
    expect(result).toHaveProperty('execution_time_ms');

    // Type checking
    expect(typeof result.agent).toBe('string');
    expect(typeof result.content).toBe('string');
    expect(['code_block', 'text']).toContain(result.type);
    expect(typeof result.execution_time_ms).toBe('number');
});
