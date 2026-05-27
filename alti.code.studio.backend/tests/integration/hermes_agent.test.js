import { test, expect, vi } from 'vitest';
import { hermesAgent } from '../../src/app/modules/agents/hermes.agent.js';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

vi.mock('child_process');

test('Hermes Agent Bridge: CLI process spawning and stdout interception', async () => {
    // 1. Mock spawn behavior
    const mockProcess = new EventEmitter();
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();

    spawn.mockReturnValue(mockProcess);

    // Trigger process behavior asynchronously
    setTimeout(() => {
        mockProcess.stdout.emit('data', Buffer.from('Hermes AI Coder task execution completed. Output: hello world'));
        mockProcess.emit('close', 0);
    }, 10);

    // 2. Invoke the agent via consult
    const result = await hermesAgent.consult("Write an audit log parser");

    // 3. Assert Telemetry Wrapper conforms perfectly
    expect(result).toHaveProperty('agent', 'HermesAgent');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('type', 'text');
    expect(result).toHaveProperty('content');
    expect(result.content).toContain('Hermes AI Coder task execution completed.');
});
