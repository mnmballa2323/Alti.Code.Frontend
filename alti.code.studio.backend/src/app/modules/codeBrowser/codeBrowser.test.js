import { describe, it, expect, vi, beforeEach } from 'vitest';
import { codeBrowserService } from './codeBrowser.service.js';
import { GuardianService } from '../guardian/guardian.service.js';
import { autonomicService } from '../surgeon/autonomic.service.js';
import { evolutionService } from '../../../shared/evolution.service.js';
import fs from 'fs/promises';
import { execFile } from 'child_process';

vi.mock('../guardian/guardian.service.js', () => {
  return {
    GuardianService: {
      auditCode: vi.fn().mockResolvedValue({ safe: true, score: 95 }),
    },
  };
});

vi.mock('../surgeon/autonomic.service.js', () => {
  return {
    autonomicService: {
      commenceProactiveSweep: vi.fn().mockResolvedValue({ clean: true }),
    },
  };
});

vi.mock('../../../shared/evolution.service.js', () => {
  return {
    evolutionService: {
      processEvolutionaryDelta: vi.fn().mockResolvedValue(['Use async/await']),
      getStylisticParameters: vi
        .fn()
        .mockResolvedValue('\nEnforced styles: Use async/await'),
    },
  };
});

vi.mock('fs/promises', () => {
  return {
    default: {
      readFile: vi.fn().mockResolvedValue('original raw content'),
      writeFile: vi.fn().mockResolvedValue(true),
    },
  };
});

vi.mock('child_process', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    execFile: vi.fn().mockImplementation((cmd, args, opts, callback) => {
      if (callback) callback(null, { stdout: 'git success', stderr: '' });
    }),
  };
});

describe('CodeBrowserService Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should safely apply a human patch, execute Guardian check, backup file, write changes, sweep AST, and commit', async () => {
    const filePath = 'src/app/modules/agents/swarm_brain.js';
    const newContent = 'new edited content';

    const result = await codeBrowserService.applyPatch(filePath, newContent);

    // 1. Audit check
    expect(GuardianService.auditCode).toHaveBeenCalledWith(
      newContent,
      'human_patch:swarm_brain.js',
    );

    // 2. Backup check
    expect(fs.readFile).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('bak.'),
      'original raw content',
    );

    // 3. Write patch check
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('swarm_brain.js'),
      newContent,
    );

    // 4. Stylistic Evolution reinforcement trigger
    expect(evolutionService.processEvolutionaryDelta).toHaveBeenCalledWith(
      'original raw content',
      newContent,
      expect.any(String),
    );

    // 5. AST Sweep
    expect(autonomicService.commenceProactiveSweep).toHaveBeenCalled();

    // 6. Return payload
    expect(result.success).toBe(true);
    expect(result.auditScore).toBe(95);
    expect(result.backupPath).toContain('.bak.');
  });

  it('should bypass stylistic evolution trigger if new content is identical to original content', async () => {
    const filePath = 'src/app/modules/agents/swarm_brain.js';
    const content = 'original raw content';

    // Mock identical read
    fs.readFile.mockResolvedValueOnce('original raw content');

    await codeBrowserService.applyPatch(filePath, content);

    expect(evolutionService.processEvolutionaryDelta).not.toHaveBeenCalled();
  });
});
