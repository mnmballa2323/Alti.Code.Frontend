global.self = global;
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exec } from 'child_process';
import { openCodeReviewService } from '../../src/app/modules/codeReviewAgent/openCodeReview.service.js';

vi.mock('child_process', () => {
    return {
        exec: vi.fn()
    };
});

describe('OpenCodeReviewService Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly execute the reviewChanges command', async () => {
        exec.mockImplementation((cmd, opts, callback) => {
            callback(null, 'Open code review complete', '');
        });

        const output = await openCodeReviewService.reviewChanges();
        expect(output).toBe('Open code review complete');
        expect(exec).toHaveBeenCalledTimes(1);

        const lastCall = exec.mock.calls[0];
        const cmd = lastCall[0];
        const opts = lastCall[1];
        expect(cmd).toBe('npx ocr review');
        expect(opts.env.OCR_LLM_URL).toContain('http://localhost:4000/v1');
        expect(opts.env.OCR_LLM_MODEL).toBe('gemini-experimental'); // Matches default from config
    });

    it('should correctly execute the reviewRange command', async () => {
        exec.mockImplementation((cmd, opts, callback) => {
            callback(null, 'Open code review complete for range', '');
        });

        const output = await openCodeReviewService.reviewRange('main', 'feature');
        expect(output).toBe('Open code review complete for range');
        expect(exec).toHaveBeenCalledTimes(1);

        const lastCall = exec.mock.calls[0];
        const cmd = lastCall[0];
        expect(cmd).toBe('npx ocr review --from main --to feature');
    });

    it('should correctly execute the reviewCommit command', async () => {
        exec.mockImplementation((cmd, opts, callback) => {
            callback(null, 'Open code review complete for commit', '');
        });

        const output = await openCodeReviewService.reviewCommit('a1b2c3d');
        expect(output).toBe('Open code review complete for commit');
        expect(exec).toHaveBeenCalledTimes(1);

        const lastCall = exec.mock.calls[0];
        const cmd = lastCall[0];
        expect(cmd).toBe('npx ocr review --commit a1b2c3d');
    });
});
