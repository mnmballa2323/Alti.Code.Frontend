import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crabboxService } from './crabbox.service.js';
import { CodeExecutionSandbox } from '../sandbox/code_execution_sandbox.js';
import { exec } from 'child_process';
import fs from 'fs';

vi.mock('child_process', () => ({
    exec: vi.fn()
}));

vi.mock('fs', async (importOriginal) => {
    const original = await importOriginal();
    return {
        ...original,
        writeFileSync: vi.fn(),
        mkdirSync: vi.fn(),
        rmSync: vi.fn()
    };
});

describe('Crabbox Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.SANDBOX_PROVIDER = 'local';
    });

    it('should run a remote command successfully via CLI', async () => {
        exec.mockImplementation((cmd, options, callback) => {
            const cb = typeof options === 'function' ? options : callback;
            cb(null, 'successful execution stdout', '');
        });

        const result = await crabboxService.run('node app.js', { provider: 'cloudflare', class: 'standard' });
        expect(result.success).toBe(true);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe('successful execution stdout');
        expect(exec).toHaveBeenCalledWith('crabbox run --provider cloudflare --class standard -- "node app.js"', expect.any(Object), expect.any(Function));
    });

    it('should warmup a box and return lease ID', async () => {
        exec.mockImplementation((cmd, options, callback) => {
            const cb = typeof options === 'function' ? options : callback;
            cb(null, 'Lease ID: lease-12345\nStatus: READY', '');
        });

        const result = await crabboxService.warmup({ provider: 'hetzner', class: 'standard', ttl: 300 });
        expect(result.success).toBe(true);
        expect(result.id).toBe('lease-12345');
        expect(exec).toHaveBeenCalledWith('crabbox warmup --provider hetzner --class standard --ttl 300', expect.any(Object), expect.any(Function));
    });

    it('should stop a lease', async () => {
        exec.mockImplementation((cmd, options, callback) => {
            const cb = typeof options === 'function' ? options : callback;
            cb(null, 'Successfully released lease', '');
        });

        const result = await crabboxService.stop('lease-12345');
        expect(result.success).toBe(true);
        expect(exec).toHaveBeenCalledWith('crabbox stop lease-12345', expect.any(Object), expect.any(Function));
    });

    it('should check status of a lease', async () => {
        exec.mockImplementation((cmd, options, callback) => {
            const cb = typeof options === 'function' ? options : callback;
            cb(null, 'Lease ID: lease-12345\nStatus: ACTIVE', '');
        });

        const result = await crabboxService.status('lease-12345');
        expect(result.success).toBe(true);
        expect(exec).toHaveBeenCalledWith('crabbox status --id lease-12345', expect.any(Object), expect.any(Function));
    });

    it('should fallback to simulation/REST if CLI is not installed (ENOENT)', async () => {
        exec.mockImplementation((cmd, options, callback) => {
            const cb = typeof options === 'function' ? options : callback;
            // Simulate command not found code
            const err = new Error('spawn crabbox ENOENT');
            err.code = 127;
            cb(err, '', 'command not found');
        });

        // Simulates REST fallback because coordinator URL is null
        const result = await crabboxService.run('node app.js');
        expect(result.success).toBe(true);
        expect(result.stdout).toContain('CRABBOX SIMULATION stdout');
    });

    it('CodeExecutionSandbox: should execute code in Crabbox if provider is crabbox', async () => {
        const runSpy = vi.spyOn(crabboxService, 'run').mockResolvedValue({
            success: true,
            exitCode: 0,
            stdout: 'hello from crabbox',
            stderr: ''
        });

        const result = await CodeExecutionSandbox.execute('console.log("hello")', { provider: 'crabbox' });
        expect(result.success).toBe(true);
        expect(result.exitCode).toBe(0);
        expect(result.logs).toEqual(['hello from crabbox']);
        expect(runSpy).toHaveBeenCalled();
    });

    it('AgentContainerOrchestrator: should execute agent tool in Crabbox if provider is crabbox', async () => {
        const { AgentContainerOrchestrator } = await import('../sandbox/agent_container_orchestrator.js');
        const orchestrator = new AgentContainerOrchestrator();

        const runSpy = vi.spyOn(crabboxService, 'run').mockResolvedValue({
            success: true,
            exitCode: 0,
            stdout: 'RESULT_PAYLOAD:{"success":true,"result":"tool output","isHandoff":false}',
            stderr: ''
        });

        const result = await orchestrator.executeAgentTool(
            'TestAgent',
            'test_tool',
            { arg1: 'val' },
            { ctxKey: 'ctxVal' },
            (args, context) => { return 'tool output'; },
            './logs/workspaces/agent_TestAgent',
            null,
            { provider: 'crabbox' }
        );

        expect(result).toBe('tool output');
        expect(runSpy).toHaveBeenCalled();
    });

    it('DockerWorkspaceManager: should execute user code in Crabbox if provider is crabbox', async () => {
        const { DockerWorkspaceManager } = await import('../sandbox/docker_workspace_manager.js');
        const manager = new DockerWorkspaceManager();

        const runSpy = vi.spyOn(crabboxService, 'run').mockResolvedValue({
            success: true,
            exitCode: 0,
            stdout: 'hello from user crabbox',
            stderr: ''
        });

        const result = await manager.executeCode('user-1', 'console.log("hello")', { provider: 'crabbox' });
        expect(result.success).toBe(true);
        expect(result.logs).toEqual(['hello from user crabbox']);
        expect(runSpy).toHaveBeenCalled();
    });

    it('DockerWorkspaceManager: should execute OSS code in Crabbox if provider is crabbox', async () => {
        const { DockerWorkspaceManager } = await import('../sandbox/docker_workspace_manager.js');
        const manager = new DockerWorkspaceManager();

        const runSpy = vi.spyOn(crabboxService, 'run').mockResolvedValue({
            success: true,
            exitCode: 0,
            stdout: 'hello from oss crabbox',
            stderr: ''
        });

        const result = await manager.executeOssCode('module-1', 'console.log("hello")', './logs/workspaces/module-1', { provider: 'crabbox' });
        expect(result.success).toBe(true);
        expect(result.exitCode).toBe(0);
        expect(result.logs).toEqual(['hello from oss crabbox']);
        expect(runSpy).toHaveBeenCalled();
    });
});
