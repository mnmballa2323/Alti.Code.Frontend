import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tddAgent } from './tdd.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { sandboxService } from '../shadowWorkspace/sandbox.service.js';

vi.mock('../gemini/gemini.service.js');
vi.mock('../shadowWorkspace/sandbox.service.js');

describe('The Continuous Agentic TDD Loop', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should iteratively loop and fix broken code until the sandbox tests pass', async () => {
        // Mock Gemini returning broken code first, then fixed code on the second iteration
        GeminiAiService.generateContent
            .mockResolvedValueOnce(`
// --- IMPLEMENTATION ---
function add(a, b) { return a - b; } // INCORRECT LOGIC

// --- TESTS ---
const assert = require('assert');
assert.strictEqual(add(5, 5), 10);
            `)
            .mockResolvedValueOnce(`
// --- IMPLEMENTATION ---
function add(a, b) { return a + b; } // FIXED LOGIC

// --- TESTS ---
const assert = require('assert');
assert.strictEqual(add(5, 5), 10);
            `);

        // Mock sandbox executing the broken code (throws) then the fixed code (resolves)
        sandboxService.execute
            .mockRejectedValueOnce(new Error('AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: -0 !== 10'))
            .mockResolvedValueOnce('Success'); // Second attempt passes

        const result = await tddAgent.developSecurely('Write a function add(a, b) that adds two numbers.');

        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);

        // Assert the second prompt contained the stack trace from the first failure
        const secondPromptCall = GeminiAiService.generateContent.mock.calls[1][0];
        expect(secondPromptCall).toContain('CRITICAL ERROR FROM PREVIOUS ATTEMPT');
        expect(secondPromptCall).toContain('AssertionError');

        expect(sandboxService.execute).toHaveBeenCalledTimes(2);
        expect(result.success).toBe(true);
        expect(result.iterations).toBe(2);
        expect(result.code).toContain('function add(a, b) { return a + b; }');
    });

    it('should escape the loop and return false if it exceeds maxLoops', async () => {
        GeminiAiService.generateContent.mockResolvedValue(`
// --- IMPLEMENTATION ---
function broken() { return false; }
// --- TESTS ---
throw new Error('Infinite crash');
        `);

        sandboxService.execute.mockRejectedValue(new Error('Syntax Error'));

        // Set maxLoops to 3
        const result = await tddAgent.developSecurely('Write an impossible function.', 3);

        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(3);
        expect(sandboxService.execute).toHaveBeenCalledTimes(3);
        expect(result.success).toBe(false);
        expect(result.iterations).toBe(3);
    });
});
