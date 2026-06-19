import { describe, it, expect, vi, beforeEach } from 'vitest';
import { crabboxSandboxService } from './crabbox_sandbox.service.js';
import { crabboxService } from './crabbox.service.js';

describe('CrabboxSandboxService Tests', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should lease a sandbox, execute command successfully, and release lease', async () => {
        const mockLease = { success: true, id: 'lease-xyz-123', status: 'READY' };
        const mockRun = { success: true, exitCode: 0, stdout: 'tests passed successfully', stderr: '' };

        const warmupSpy = vi.spyOn(crabboxService, 'warmup').mockResolvedValue(mockLease);
        const runSpy = vi.spyOn(crabboxService, 'run').mockResolvedValue(mockRun);
        const stopSpy = vi.spyOn(crabboxService, 'stop').mockResolvedValue({ success: true });

        const result = await crabboxSandboxService.executeInSandbox('npm test', { timeoutMs: 5000 });

        expect(result.success).toBe(true);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toBe('tests passed successfully');
        expect(result.leaseId).toBe('lease-xyz-123');
        expect(result.timedOut).toBe(false);

        expect(warmupSpy).toHaveBeenCalled();
        expect(runSpy).toHaveBeenCalledWith('npm test', expect.objectContaining({ id: 'lease-xyz-123' }));
        expect(stopSpy).toHaveBeenCalledWith('lease-xyz-123');
    });

    it('should fail if the sandbox warmup lease fails to provision', async () => {
        const mockLease = { success: false, stderr: 'No cloud resources available' };

        vi.spyOn(crabboxService, 'warmup').mockResolvedValue(mockLease);
        const stopSpy = vi.spyOn(crabboxService, 'stop');

        const result = await crabboxSandboxService.executeInSandbox('npm run build');

        expect(result.success).toBe(false);
        expect(result.stderr).toContain('Failed to provision sandbox lease');
        expect(stopSpy).not.toHaveBeenCalled();
    });

    it('should trigger a timeout error if sandbox command execution hangs', async () => {
        const mockLease = { success: true, id: 'lease-slow-999' };
        
        vi.spyOn(crabboxService, 'warmup').mockResolvedValue(mockLease);
        // Make the run command hang infinitely
        vi.spyOn(crabboxService, 'run').mockImplementation(() => new Promise(() => {}));
        const stopSpy = vi.spyOn(crabboxService, 'stop').mockResolvedValue({ success: true });

        const result = await crabboxSandboxService.executeInSandbox('node infinite_loop.js', { timeoutMs: 50 });

        expect(result.success).toBe(false);
        expect(result.timedOut).toBe(true);
        expect(result.stderr).toContain('timed out');
        expect(stopSpy).toHaveBeenCalledWith('lease-slow-999');
    });
});
