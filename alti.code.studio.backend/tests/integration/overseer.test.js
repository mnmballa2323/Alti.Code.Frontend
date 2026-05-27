global.self = global;
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { overseerAgent } from '../../src/app/modules/agents/overseer.agent.js';
import { DebugAgentService } from '../../src/app/modules/debugAgent/debugAgent.service.js';
import { sandboxService } from '../../src/app/modules/shadowWorkspace/sandbox.service.js';
import fs from 'fs/promises';
import path from 'path';

vi.mock('../../src/app/modules/debugAgent/debugAgent.service.js', () => ({
    DebugAgentService: {
        analyzeError: vi.fn().mockImplementation(async (errorLog) => {
            return {
                bugSeverity: 'MEDIUM',
                patchedCode: 'console.log("Patched successfully");'
            };
        })
    }
}));

vi.mock('../../src/app/modules/shadowWorkspace/sandbox.service.js', () => ({
    sandboxService: {
        execute: vi.fn()
            .mockRejectedValueOnce(new Error('SyntaxError: Unexpected token'))
            .mockResolvedValue('Execution success')
    }
}));

describe('OverseerAgent CI/CD Self-Healing Monitor Integration Tests', () => {
    it('should robustly extract absolute and relative paths that exist on disk', async () => {
        // Create a temporary file to match against
        const tempFile = path.resolve(process.cwd(), 'temp-test-overseer.js');
        await fs.writeFile(tempFile, 'console.log("hello");', 'utf8');

        try {
            const unixLog = `Error: Something went wrong\n  at Object.<anonymous> (${tempFile}:12:34)`;
            const matchedUnix = await overseerAgent._extractFilePathFromLog(unixLog, process.cwd());
            expect(matchedUnix).toBe(tempFile);

            const vitestLog = ` ❯ temp-test-overseer.js:12:34`;
            const matchedVitest = await overseerAgent._extractFilePathFromLog(vitestLog, process.cwd());
            expect(matchedVitest).toBe(tempFile);

            const nonexistentLog = `at nonexistent-file.js:12:34`;
            const matchedNonexistent = await overseerAgent._extractFilePathFromLog(nonexistentLog, process.cwd());
            expect(matchedNonexistent).toBeNull();
        } finally {
            await fs.unlink(tempFile).catch(() => {});
        }
    });

    it('should execute a simple shell command successfully', async () => {
        const result = await overseerAgent._runShellCommand('echo "hello"', process.cwd());
        expect(result.trim()).toBe('hello');
    });

    it('should auto-heal sandbox code execution upon experiencing a runtime crash', async () => {
        const result = await overseerAgent.executeInSandboxAndHeal('console.log("crashing");');
        
        expect(result.status).toBe('success');
        expect(result.healed).toBe(true);
        expect(result.finalCode).toBe('console.log("Patched successfully");');
    });
});
