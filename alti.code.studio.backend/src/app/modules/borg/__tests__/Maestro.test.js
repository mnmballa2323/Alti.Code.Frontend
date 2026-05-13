import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import { maestro } from '../Maestro.js';

// Mock dependencies before importing the module
vi.mock('fs');
const { execMock } = vi.hoisted(() => ({ execMock: vi.fn() }));
vi.mock('child_process', () => ({
    default: { exec: execMock },
    exec: execMock
}));
vi.mock('../../../shared/logger.js', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    }
}));

describe('Maestro (Borg Worktree Manager)', () => {
    // We isolate imports to apply mocks
    beforeAll(() => {
        // Mock util.promisify for exec
        execMock.mockImplementation((cmd, options, cb) => {
            if (typeof options === 'function') cb = options;
            cb(null, { stdout: 'success', stderr: '' });
        });

        fs.existsSync.mockReturnValue(false); // Default to not exist
        fs.mkdirSync.mockImplementation(() => { });
    });

    beforeEach(() => {
        vi.clearAllMocks();
        maestro.activeSwarms.clear();
    });

    it('should provision a new git worktree successfully', async () => {
        fs.existsSync.mockReturnValue(false);

        const taskId = 'test-123';
        const worktreePath = await maestro.provisionWorktree(taskId);

        expect(worktreePath).toContain(`task-${taskId}`);
        expect(execMock).toHaveBeenCalled();
        const execCall = execMock.mock.calls[0][0];
        expect(execCall).toContain('git worktree add');
        expect(maestro.activeSwarms.has(taskId)).toBe(true);
    });

    it('should handle worktree provisioning failure and fallback to cwd', async () => {
        fs.existsSync.mockReturnValue(false);
        execMock.mockImplementationOnce((cmd, opts, cb) => cb(new Error('Git failure')));

        const taskId = 'fail-test';
        const worktreePath = await maestro.provisionWorktree(taskId);

        expect(worktreePath).toBe(process.cwd());
    });

    it('should cleanup an active worktree', async () => {
        fs.existsSync.mockReturnValue(false);
        const taskId = 'cleanup-test';
        await maestro.provisionWorktree(taskId);

        expect(maestro.activeSwarms.has(taskId)).toBe(true);

        await maestro.cleanupWorktree(taskId);

        expect(execMock).toHaveBeenCalledWith(
            expect.stringContaining('git worktree remove'),
            expect.any(Function)
        );
        expect(maestro.activeSwarms.has(taskId)).toBe(false);
    });
});
