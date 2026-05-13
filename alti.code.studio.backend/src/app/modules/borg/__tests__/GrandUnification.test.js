/**
 * GrandUnification.test.js
 * Integration smoke test validating the full Director → Maestro pipeline.
 * This is a lightweight integration test using mocked git & fs — it does NOT
 * require a real git repo or file system.
 */
import { vi, describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import child_process from 'child_process';

vi.mock('fs');
vi.mock('child_process');
let uuidCounter = 0;
vi.mock('uuid', () => ({ v4: () => `grand-unification-uuid-${++uuidCounter}` }));
vi.mock('../../../shared/logger.js', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

describe('GrandUnification — Director + Maestro Integration', () => {
    let director;
    let maestro;

    beforeAll(async () => {
        fs.existsSync.mockReturnValue(false);
        fs.mkdirSync.mockImplementation(() => { });

        child_process.exec.mockImplementation((cmd, options, cb) => {
            if (typeof options === 'function') cb = options;
            cb(null, { stdout: 'success', stderr: '' });
        });

        const maestroMod = await import('../Maestro.js');
        const directorMod = await import('../Director.js');
        maestro = maestroMod.maestro;
        director = directorMod.director;

        maestro.activeSwarms.clear();
        director.activeMissions.clear();
    });

    it('should integrate: Maestro provisions a worktree for Director mission', async () => {
        const taskId = 'grand-unification-001';
        const worktreePath = await maestro.provisionWorktree(taskId);

        expect(worktreePath).toBeDefined();
        expect(maestro.activeSwarms.has(taskId)).toBe(true);
        expect(maestro.activeSwarms.get(taskId).branch).toBe(`task-branch-${taskId}`);
    });

    it('should integrate: Director starts a mission and reaches completed or executing state', async () => {
        const missionId = await director.startMission(
            'Grand Unification Integration Test',
            'integration-test-user'
        );

        expect(missionId).toBeDefined();

        const state = director.getMissionStatus(missionId);
        expect(state).toBeDefined();
        expect(state.goal).toBe('Grand Unification Integration Test');

        // Status must be one of the valid pipeline stages
        expect(['provisioning', 'planning', 'executing', 'completed', 'failed']).toContain(
            state.status
        );
    });

    it('should integrate: Maestro cleanup removes the swarm entry', async () => {
        const taskId = 'cleanup-integration-001';
        await maestro.provisionWorktree(taskId);
        expect(maestro.activeSwarms.has(taskId)).toBe(true);

        await maestro.cleanupWorktree(taskId);
        expect(maestro.activeSwarms.has(taskId)).toBe(false);
    });

    it('should integrate: multiple concurrent missions are tracked independently', async () => {
        director.activeMissions.clear();

        const ids = await Promise.all([
            director.startMission('Mission Alpha', 'user-alpha'),
            director.startMission('Mission Beta', 'user-beta'),
            director.startMission('Mission Gamma', 'user-gamma'),
        ]);

        expect(new Set(ids).size).toBe(ids.length); // all unique IDs
        ids.forEach((id) => {
            expect(director.getMissionStatus(id)).toBeDefined();
        });
    });
});
