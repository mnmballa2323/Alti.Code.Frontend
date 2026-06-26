import { describe, it, expect, vi, beforeEach } from 'vitest';
import { metamorphicAgent } from './metamorphic.agent.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';

vi.mock('../app/modules/gemini/gemini.service.js');
vi.mock('fs/promises');

describe('Sentient Self-Rewriting (Phase 32 - The Metamorphic Core)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run a diagnostic on its own orchestration code and generate an optimization PR', async () => {
    // Mocking Alti's own orchestrator file containing a naive sequential bottleneck
    const selfCode = `
            for (const agent of swarm) {
                await agent.execute(task); // Sequential bottleneck!
            }
        `;
    fs.readFile.mockResolvedValueOnce(selfCode);

    // Mocking the LLM identifying the issue and rewriting itself
    const selfPrPayload = {
      title: 'Refactor: Parallelize Swarm Orchestration',
      description:
        'Identified a sequential loop bottleneck in task delegation. Upgrading to Promise.all.',
      diff: '- await agent.execute(task);\n+ await Promise.all(swarm.map(a => a.execute(task)));',
    };
    GeminiAiService.generateContent.mockResolvedValueOnce(
      JSON.stringify(selfPrPayload),
    );

    const pr = await metamorphicAgent.runSelfDiagnostic(
      '/mock/src/app/modules/agents',
    );

    // ASSERTIONS

    // 1. It read its own source code
    expect(fs.readFile).toHaveBeenCalledWith(
      '/mock/src/app/modules/agents/orchestrator.agent.js',
      'utf8',
    );

    // 2. The LLM was used to generate the self-PR
    expect(GeminiAiService.generateContent).toHaveBeenCalled();

    // 3. The PR object returned matches the optimization
    expect(pr.title).toBe('Refactor: Parallelize Swarm Orchestration');
    expect(pr.diff).toContain('Promise.all');
  });
});
