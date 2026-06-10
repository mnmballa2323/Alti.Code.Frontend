import { test, expect, vi } from 'vitest';
import { clawCodeRouterService } from '../../src/app/modules/clawCode/clawCodeRouter.service.js';
import { swarmBrain } from '../../src/app/modules/agents/swarm_brain.js';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';

vi.mock('child_process');

test('ClawCodeRouter: shouldRouteToClawCode classification', () => {
    expect(clawCodeRouterService.shouldRouteToClawCode('explain recursive functions')).toBe(false);
    expect(clawCodeRouterService.shouldRouteToClawCode('write a test file')).toBe(true);
    expect(clawCodeRouterService.shouldRouteToClawCode('fix the sidebar links')).toBe(true);
});

test('ClawCodeRouter: executes task by spawning Claw CLI and returning stdout with progress streaming', async () => {
    const mockProcess = new EventEmitter();
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();

    spawn.mockReturnValue(mockProcess);

    const progressCalls = [];
    const onProgress = (payload) => {
        progressCalls.push(payload);
    };

    setTimeout(() => {
        mockProcess.stdout.emit('data', Buffer.from('Claw-Code successfully updated the file layout.tsx'));
        mockProcess.emit('close', 0);
    }, 10);

    const result = await clawCodeRouterService.executeTask('fix the sidebar links', [], onProgress);
    expect(result).toContain('Claw-Code successfully updated the file');
    expect(progressCalls.length).toBeGreaterThan(0);
    expect(progressCalls.some(p => p.status === 'executing' && p.message.includes('Claw-Code successfully'))).toBe(true);
});

test('SwarmBrain to Claw-Code Router Integration', async () => {
    // Force routing to Claw-Code by setting PREFERRED_AGENT
    const originalPreferred = process.env.PREFERRED_AGENT;
    process.env.PREFERRED_AGENT = 'claw';

    // Mock fs.existsSync to make sure the router thinks the claw binary is installed
    const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    const originalExecute = clawCodeRouterService.executeTask;
    clawCodeRouterService.executeTask = vi.fn().mockResolvedValue('Claw-Code routed output successfully');

    const result = await swarmBrain.executeTask('fix the layout.tsx file');

    expect(clawCodeRouterService.executeTask).toHaveBeenCalled();
    expect(result).toBe('Claw-Code routed output successfully');

    // Restore original states
    clawCodeRouterService.executeTask = originalExecute;
    existsSpy.mockRestore();
    if (originalPreferred === undefined) {
        delete process.env.PREFERRED_AGENT;
    } else {
        process.env.PREFERRED_AGENT = originalPreferred;
    }
});
