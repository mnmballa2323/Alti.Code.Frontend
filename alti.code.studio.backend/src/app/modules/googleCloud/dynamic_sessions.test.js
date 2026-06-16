import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dynamicSessionsService } from './dynamic_sessions.service.js';
import { CodeExecutionSandbox } from '../sandbox/code_execution_sandbox.js';
import { DockerWorkspaceManager } from '../sandbox/docker_workspace_manager.js';

// Mock CodeExecutionSandbox and DockerWorkspaceManager
vi.mock('../sandbox/code_execution_sandbox.js', () => {
    return {
        CodeExecutionSandbox: {
            execute: vi.fn()
        }
    };
});

vi.mock('../sandbox/docker_workspace_manager.js', () => {
    const MockClass = vi.fn().mockImplementation(function() {
        return {
            checkDockerAvailability: vi.fn(),
            executeOssCode: vi.fn(),
            _execCmd: vi.fn(),
            baseSandboxDir: './logs/workspaces/oss_generic'
        };
    });
    return {
        DockerWorkspaceManager: MockClass
    };
});

describe('GoogleDynamicSessionsService with Graceful Sandbox Fallbacks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('should return GCP execution results directly when successful', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ status: 'OK', stdout: 'GCP Output', stderr: '' })
        };
        global.fetch = vi.fn().mockResolvedValue(mockResponse);

        // Mock auth client
        dynamicSessionsService.auth.getClient = vi.fn().mockResolvedValue({
            getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' })
        });

        const result = await dynamicSessionsService.executeCode('console.log("hello")', 'javascript');

        expect(result.success).toBe(true);
        expect(result.stdout).toBe('GCP Output');
        expect(result.stderr).toBe('');
        expect(global.fetch).toHaveBeenCalled();
    });

    it('should gracefully fallback to CodeExecutionSandbox for Node.js if GCP execution throws an auth error', async () => {
        // Mock auth to throw an error (e.g. unauthenticated / offline)
        dynamicSessionsService.auth.getClient = vi.fn().mockRejectedValue(new Error('Could not load the default credentials.'));

        // Mock local sandbox execution
        CodeExecutionSandbox.execute.mockResolvedValueOnce({
            success: true,
            logs: ['Local JS Output'],
            errors: []
        });

        const result = await dynamicSessionsService.executeCode('console.log("hello")', 'nodejs');

        expect(result.success).toBe(true);
        expect(result.stdout).toBe('Local JS Output');
        expect(result.stderr).toBe('');
        expect(CodeExecutionSandbox.execute).toHaveBeenCalledWith('console.log("hello")', expect.any(Object));
    });

    it('should gracefully fallback to DockerWorkspaceManager for Python (with Docker) if GCP API returns HTTP 500', async () => {
        const mockResponse = {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: async () => 'Service Unavailable'
        };
        global.fetch = vi.fn().mockResolvedValue(mockResponse);

        dynamicSessionsService.auth.getClient = vi.fn().mockResolvedValue({
            getAccessToken: vi.fn().mockResolvedValue({ token: 'mock-token' })
        });

        // Mock Docker Workspace Manager with Docker available
        const mockManagerInstance = {
            checkDockerAvailability: vi.fn().mockResolvedValue(true),
            executeOssCode: vi.fn().mockResolvedValue({
                success: true,
                logs: ['Python Docker Output'],
                errors: []
            })
        };
        DockerWorkspaceManager.mockImplementationOnce(function() {
            return mockManagerInstance;
        });

        const result = await dynamicSessionsService.executeCode('print("hello")', 'python');

        expect(result.success).toBe(true);
        expect(result.stdout).toBe('Python Docker Output');
        expect(result.stderr).toBe('');
        expect(mockManagerInstance.checkDockerAvailability).toHaveBeenCalled();
        expect(mockManagerInstance.executeOssCode).toHaveBeenCalledWith(
            'agent_generic',
            'print("hello")',
            './logs/workspaces/agent_generic',
            { language: 'python', timeoutMs: 5000 }
        );
    });

    it('should gracefully fallback to local Python host command execution if GCP fails and Docker is not available', async () => {
        dynamicSessionsService.auth.getClient = vi.fn().mockRejectedValue(new Error('Auth failed'));

        // Mock Docker Workspace Manager with Docker UNAVAILABLE
        const mockManagerInstance = {
            checkDockerAvailability: vi.fn().mockResolvedValue(false),
            _execCmd: vi.fn().mockResolvedValue({
                success: true,
                stdout: 'Host Python Output',
                stderr: '',
                error: null,
                exitCode: 0
            }),
            baseSandboxDir: './logs/workspaces/oss_generic'
        };
        DockerWorkspaceManager.mockImplementationOnce(function() {
            return mockManagerInstance;
        });

        const result = await dynamicSessionsService.executeCode('print("hello")', 'python');

        expect(result.success).toBe(true);
        expect(result.stdout).toBe('Host Python Output');
        expect(result.stderr).toBe('');
        expect(mockManagerInstance.checkDockerAvailability).toHaveBeenCalled();
        expect(mockManagerInstance._execCmd).toHaveBeenCalled();
    });
});
