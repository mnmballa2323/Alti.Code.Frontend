import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sandboxService } from '../../src/app/modules/agents/sandbox.service.js';

// Mock CodeInterpreter from @e2b/code-interpreter
vi.mock('@e2b/code-interpreter', () => {
  const mockSandbox = {
    id: 'test-sandbox-id',
    commands: {
      run: vi.fn().mockResolvedValue({
        exitCode: 0,
        stdout: 'Mock Command Output',
        stderr: ''
      })
    },
    notebook: {
      execCell: vi.fn().mockResolvedValue({
        logs: {
          stdout: ['Mock Python Output'],
          stderr: []
        },
        error: null
      })
    },
    close: vi.fn().mockResolvedValue(undefined)
  };

  return {
    default: {
      CodeInterpreter: {
        create: vi.fn().mockResolvedValue(mockSandbox)
      }
    }
  };
});

describe('E2B Sandbox Code Execution Service Tests', () => {
  let originalApiKey;
  let originalSandboxMode;

  beforeEach(() => {
    vi.clearAllMocks();
    originalApiKey = process.env.E2B_API_KEY;
    originalSandboxMode = process.env.USE_E2B_SANDBOX;
  });

  afterEach(() => {
    process.env.E2B_API_KEY = originalApiKey;
    process.env.USE_E2B_SANDBOX = originalSandboxMode;
  });

  it('should report inactive if E2B_API_KEY is not defined', async () => {
    delete process.env.E2B_API_KEY;
    // Reinitialize sandbox service api key check
    const { SandboxService } = await import('../../src/app/modules/agents/sandbox.service.js');
    const tempService = new SandboxService();
    expect(tempService.isActive()).toBe(false);
  });

  it('should throw error executing command when E2B is inactive', async () => {
    delete process.env.E2B_API_KEY;
    const { SandboxService } = await import('../../src/app/modules/agents/sandbox.service.js');
    const tempService = new SandboxService();
    await expect(tempService.executeCommand('ls -la')).rejects.toThrow('E2B_API_KEY is not configured');
  });

  it('should execute command successfully using CodeInterpreter sandbox when active', async () => {
    process.env.E2B_API_KEY = 'test-api-key';
    
    // Import again to pick up the env key
    const { SandboxService } = await import('../../src/app/modules/agents/sandbox.service.js');
    const tempService = new SandboxService();

    expect(tempService.isActive()).toBe(true);

    const result = await tempService.executeCommand('echo "Mock Command Output"');
    expect(result.success).toBe(true);
    expect(result.stdout).toBe('Mock Command Output');
    expect(result.exitCode).toBe(0);
  });

  it('should execute Python code successfully in execution cell', async () => {
    process.env.E2B_API_KEY = 'test-api-key';
    const { SandboxService } = await import('../../src/app/modules/agents/sandbox.service.js');
    const tempService = new SandboxService();

    const result = await tempService.runCode('print("Mock Python Output")', 'python');
    expect(result.success).toBe(true);
    expect(result.stdout).toContain('Mock Python Output');
  });
});
