import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SentryHealingLoopService } from '../../src/app/modules/observability/sentry_healing_loop.service.js';
import { CodeExecutionSandbox } from '../../src/app/modules/sandbox/code_execution_sandbox.js';
import { SocraticDebateChamber } from '../../src/app/modules/agents/socratic_debate_chamber.js';
import { PolicyComplianceGate } from '../../src/app/middlewares/policyComplianceGate.js';

// Mock SocraticDebateChamber and PolicyComplianceGate
vi.mock('../../src/app/modules/agents/socratic_debate_chamber.js', () => ({
    SocraticDebateChamber: {
        runDebate: vi.fn(async () => ({
            consensus: true,
            approvedProposal: 'function divide(a, b) { if (b === 0) return 0; return a / b; }'
        }))
    }
}));

vi.mock('../../src/app/middlewares/policyComplianceGate.js', () => ({
    PolicyComplianceGate: {
        verify: vi.fn(() => ({ isValid: true, errors: [] }))
    }
}));

describe('Milestone v50.0.0 Feature Tests: Sentry Healing Loops', () => {
    const mockCulpritFile = path.resolve('./logs/workspaces/v50_culprit.js');

    beforeAll(() => {
        const originalCode = 'function divide(a, b) { return a / b; }';
        fs.mkdirSync(path.dirname(mockCulpritFile), { recursive: true });
        fs.writeFileSync(mockCulpritFile, originalCode, 'utf8');
    });

    afterAll(() => {
        try {
            fs.unlinkSync(mockCulpritFile);
        } catch (e) {}
    });

    it('should consume sentry event, replicate bug in sandbox, debate fix, verify patch, and generate patch file', async () => {
        const event = {
            errorName: 'ZeroDivisionError',
            errorMessage: 'division by zero',
            culpritFile: mockCulpritFile,
            culpritLine: 1,
            codeSnippet: 'throw new Error("division by zero");',
            symbolName: 'divide'
        };

        const result = await SentryHealingLoopService.handleSentryEvent(event);

        expect(result.success).toBe(true);
        expect(result.patchPath).toBeDefined();
        expect(fs.existsSync(result.patchPath)).toBe(true);
        expect(result.healedCode).toContain('divide(a, b)');

        // Verify sub-stages were invoked
        expect(SocraticDebateChamber.runDebate).toHaveBeenCalled();
        expect(PolicyComplianceGate.verify).toHaveBeenCalled();

        // Cleanup generated patch
        try {
            fs.unlinkSync(result.patchPath);
        } catch (e) {}
    });
});
