import { describe, it, expect, vi, beforeEach } from 'vitest';
import { selfHealingTestSuiteService } from './self_healing_test_suite.service.js';
import { aiProvider } from '../ai/ai.provider.js';

vi.mock('../ai/ai.provider.js', () => ({
  aiProvider: {
    reason: vi.fn(),
  },
}));

describe('SelfHealingTestSuiteService Tests', () => {
  let mockFiles;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFiles = {
      'test.js': 'describe("test")',
      'impl.js': 'const a = 1;',
    };
  });

  const mockRead = async path => mockFiles[path];
  const mockWrite = async (path, content) => {
    mockFiles[path] = content;
  };

  it('should return early if the test suite is already passing', async () => {
    const mockExec = vi
      .fn()
      .mockResolvedValue({ success: true, stdout: '', stderr: '' });

    const result = await selfHealingTestSuiteService.healTestSuite(
      'test.js',
      'impl.js',
      'npm test',
      { execFn: mockExec, readFn: mockRead, writeFn: mockWrite },
    );

    expect(result.healed).toBe(false);
    expect(result.message).toBe('Test suite already passing');
    expect(mockExec).toHaveBeenCalledTimes(1);
  });

  it('should apply patch and report success if the healed test run passes', async () => {
    // First exec fails, second passes
    const mockExec = vi
      .fn()
      .mockResolvedValueOnce({
        success: false,
        stdout: 'Test failed: expected 2 to be 3',
        stderr: '',
      })
      .mockResolvedValueOnce({
        success: true,
        stdout: 'All tests passed',
        stderr: '',
      });

    aiProvider.reason.mockResolvedValue(
      JSON.stringify({
        diagnosis: 'Fixing expectation value discrepancy',
        fixedTestContent: 'describe("test updated")',
        fixedImplementationContent: 'const a = 2;',
      }),
    );

    const result = await selfHealingTestSuiteService.healTestSuite(
      'test.js',
      'impl.js',
      'npm test',
      { execFn: mockExec, readFn: mockRead, writeFn: mockWrite },
    );

    expect(result.healed).toBe(true);
    expect(result.diagnosis).toBe('Fixing expectation value discrepancy');
    expect(mockFiles['test.js']).toBe('describe("test updated")');
    expect(mockFiles['impl.js']).toBe('const a = 2;');
    expect(mockExec).toHaveBeenCalledTimes(2);
  });

  it('should roll back changes if the test suite still fails after applying the patch', async () => {
    // Both exec runs fail
    const mockExec = vi
      .fn()
      .mockResolvedValue({ success: false, stdout: 'Test failed', stderr: '' });

    aiProvider.reason.mockResolvedValue(
      JSON.stringify({
        diagnosis: 'Attempting invalid fix',
        fixedTestContent: 'describe("broken test")',
        fixedImplementationContent: 'const a = 3;',
      }),
    );

    const result = await selfHealingTestSuiteService.healTestSuite(
      'test.js',
      'impl.js',
      'npm test',
      { execFn: mockExec, readFn: mockRead, writeFn: mockWrite },
    );

    expect(result.healed).toBe(false);
    expect(result.error).toBe('Verification run failed after applying patches');
    // Verify rollback happened
    expect(mockFiles['test.js']).toBe('describe("test")');
    expect(mockFiles['impl.js']).toBe('const a = 1;');
  });
});
