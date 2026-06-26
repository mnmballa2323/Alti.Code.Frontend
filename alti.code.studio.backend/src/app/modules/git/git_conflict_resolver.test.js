import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gitConflictResolverService } from './git_conflict_resolver.service.js';
import { aiProvider } from '../ai/ai.provider.js';

vi.mock('../ai/ai.provider.js', () => ({
  aiProvider: {
    reason: vi.fn(),
  },
}));

describe('GitConflictResolverService Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should skip resolving if no conflict markers exist', async () => {
    const cleanContent = 'const x = 5;\nconsole.log(x);';
    const result = await gitConflictResolverService.resolveConflicts(
      cleanContent,
      'src/index.js',
    );
    expect(result).toBe(cleanContent);
    expect(aiProvider.reason).not.toHaveBeenCalled();
  });

  it('should parse conflict markers and merge using AI provider', async () => {
    const conflictingContent = `
const a = 1;
<<<<<<< HEAD
const b = 2; // our change
=======
const b = 3; // their change
const c = 4;
>>>>>>> feature-branch
console.log(a, b);
        `;

    const expectedMerge = 'const b = 2;\nconst c = 4;';
    aiProvider.reason.mockResolvedValueOnce(expectedMerge);

    const result = await gitConflictResolverService.resolveConflicts(
      conflictingContent,
      'src/app.js',
    );

    expect(aiProvider.reason).toHaveBeenCalled();
    expect(result).toContain('const a = 1;');
    expect(result).toContain('const b = 2;\nconst c = 4;');
    expect(result).toContain('console.log(a, b);');
    expect(result).not.toContain('<<<<<<< HEAD');
    expect(result).not.toContain('=======');
    expect(result).not.toContain('>>>>>>> feature-branch');
  });
});
