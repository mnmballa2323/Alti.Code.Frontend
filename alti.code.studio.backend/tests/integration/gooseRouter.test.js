import { test, expect, vi } from 'vitest';
import { gooseRouterService } from '../../src/app/modules/goose/gooseRouter.service.js';
import { swarmBrain } from '../../src/app/modules/agents/swarm_brain.js';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

vi.mock('child_process');

test('GooseRouter: shouldRouteToGoose classification', () => {
    expect(gooseRouterService.shouldRouteToGoose('explain recursive functions')).toBe(false);
    expect(gooseRouterService.shouldRouteToGoose('write a test file')).toBe(true);
    expect(gooseRouterService.shouldRouteToGoose('fix the sidebar links')).toBe(true);
});

test('GooseRouter: executes task by spawning Goose CLI and returning stdout', async () => {
    const mockProcess = new EventEmitter();
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();

    spawn.mockReturnValue(mockProcess);

    setTimeout(() => {
        mockProcess.stdout.emit('data', Buffer.from('Goose successfully updated the file layout.tsx'));
        mockProcess.emit('close', 0);
    }, 10);

    const result = await gooseRouterService.executeTask('fix the sidebar links');
    expect(result).toContain('Goose successfully updated the file');
});

test('SwarmBrain to Goose Router Integration', async () => {
    const originalExecute = gooseRouterService.executeTask;
    gooseRouterService.executeTask = vi.fn().mockResolvedValue('Goose routed output successfully');

    const result = await swarmBrain.executeTask('fix the layout.tsx file');

    expect(gooseRouterService.executeTask).toHaveBeenCalled();
    expect(result).toBe('Goose routed output successfully');

    gooseRouterService.executeTask = originalExecute;
});
