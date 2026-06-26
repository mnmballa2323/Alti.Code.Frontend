import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selfHealingSwarmService } from './self_healing_swarm.service.js';
import { aiProvider } from '../ai/ai.provider.js';

describe('SelfHealingSwarmService Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully heal a task failure after consulting the AI provider', async () => {
    const mockPromptResponse = JSON.stringify({
      diagnosis: 'Missing closing parenthesis in function definition',
      proposedFix: 'Add closing parenthesis at line 42',
      fixedCode: 'function test() { return 1; }',
      targetFile: 'src/utils.js',
    });

    const consultSpy = vi
      .spyOn(aiProvider, 'reason')
      .mockResolvedValue(mockPromptResponse);

    const taskData = { id: 'task-999', file: 'src/utils.js' };
    const errorLog = 'SyntaxError: Unexpected token }';

    const result = await selfHealingSwarmService.healTaskFailure(
      taskData,
      errorLog,
      3,
    );

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
    expect(result.patchesApplied.length).toBe(1);
    expect(result.patchesApplied[0].targetFile).toBe('src/utils.js');
    expect(result.patchesApplied[0].diagnosis).toBe(
      'Missing closing parenthesis in function definition',
    );
    expect(result.remediedError).toBeNull();
    expect(consultSpy).toHaveBeenCalled();
  });

  it('should retry up to maxRetries if the fix continues to fail (simulating unresolvable errors)', async () => {
    // Mock a failure by having the verification return false (we bypass NODE_ENV = test check by stubbing _verifyFix)
    vi.spyOn(selfHealingSwarmService, '_verifyFix').mockReturnValue(false);
    vi.spyOn(aiProvider, 'reason').mockResolvedValue(
      'invalid-mock-json-that-causes-fallback',
    );

    const taskData = { id: 'task-fail', file: 'src/broken.js' };
    const errorLog = 'ReferenceError: x is not defined';

    const result = await selfHealingSwarmService.healTaskFailure(
      taskData,
      errorLog,
      2,
    );

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(2);
    expect(result.patchesApplied.length).toBe(2);
    expect(result.remediedError).toContain(
      'failed verification check after applying patch',
    );
  });
});
