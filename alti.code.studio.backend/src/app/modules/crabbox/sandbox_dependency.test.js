import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sandboxDependencyService } from './sandbox_dependency.service.js';

describe('SandboxDependencyService Tests', () => {
    beforeEach(() => {
        sandboxDependencyService.installedPackages.clear();
    });

    it('should parse Node.js missing module error log', () => {
        const errorLog = "Error: Cannot find module 'lodash/fp'\n    at Function.Module._resolveFilename";
        const pkg = sandboxDependencyService.resolveMissingPackage(errorLog);
        expect(pkg).toBe('lodash');
    });

    it('should parse Python ModuleNotFoundError error log', () => {
        const errorLog = "Traceback (most recent call last):\n  File \"main.py\", line 1, in <module>\nModuleNotFoundError: No module named 'requests'";
        const pkg = sandboxDependencyService.resolveMissingPackage(errorLog);
        expect(pkg).toBe('requests');
    });

    it('should trigger correct npm install command in sandbox executor', async () => {
        const mockExecutor = {
            exec: vi.fn().mockResolvedValue({ stdout: 'npm install complete' })
        };

        const success = await sandboxDependencyService.installDependency('lodash', 'node', mockExecutor);

        expect(success).toBe(true);
        expect(mockExecutor.exec).toHaveBeenCalledWith('npm install lodash');
        expect(sandboxDependencyService.installedPackages.has('lodash')).toBe(true);
    });

    it('should trigger correct pip install command in sandbox executor for python runtime', async () => {
        const mockExecutor = {
            exec: vi.fn().mockResolvedValue({ stdout: 'pip install complete' })
        };

        const success = await sandboxDependencyService.installDependency('requests', 'python', mockExecutor);

        expect(success).toBe(true);
        expect(mockExecutor.exec).toHaveBeenCalledWith('pip install requests');
        expect(sandboxDependencyService.installedPackages.has('requests')).toBe(true);
    });
});
