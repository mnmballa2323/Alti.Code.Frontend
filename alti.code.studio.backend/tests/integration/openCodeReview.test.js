global.self = global;
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import config from '../../config/index.js';
import { openCodeReviewService } from '../../src/app/modules/codeReviewAgent/openCodeReview.service.js';
import { codeReviewWorkerProcessor } from '../../src/app/modules/codeReviewAgent/codeReview.worker.js';
import { aiProvider } from '../../src/app/modules/ai/ai.provider.js';

const createMockChildProcess = (stdoutData = '', stderrData = '', code = 0) => {
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    
    setTimeout(() => {
        if (stdoutData) child.stdout.emit('data', Buffer.from(stdoutData));
        if (stderrData) child.stderr.emit('data', Buffer.from(stderrData));
        child.emit('close', code);
    }, 10);
    
    return child;
};

vi.mock('child_process', () => {
    return {
        spawn: vi.fn()
    };
});

describe('OpenCodeReview Integration & Worker Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe('OpenCodeReviewService', () => {
        it('should correctly execute the reviewChanges command', async () => {
            spawn.mockImplementation(() => {
                return createMockChildProcess('Open code review complete', '', 0);
            });

            const output = await openCodeReviewService.reviewChanges();
            expect(output).toBe('Open code review complete');
            expect(spawn).toHaveBeenCalledTimes(1);

            const lastCall = spawn.mock.calls[0];
            const cmd = lastCall[0];
            const args = lastCall[1];
            const opts = lastCall[2];
            
            expect(cmd).toBe('npx');
            expect(args).toEqual(['ocr', 'review']);
            expect(opts.env.OCR_LLM_URL).toContain('http://localhost:4000/v1');
            expect(opts.env.OCR_LLM_MODEL).toBe(config.azure.model_name || 'gpt-5.5');
        });

        it('should correctly execute the reviewRange command', async () => {
            spawn.mockImplementation(() => {
                return createMockChildProcess('Open code review complete for range', '', 0);
            });

            const output = await openCodeReviewService.reviewRange('main', 'feature');
            expect(output).toBe('Open code review complete for range');
            expect(spawn).toHaveBeenCalledTimes(1);

            const lastCall = spawn.mock.calls[0];
            const cmd = lastCall[0];
            const args = lastCall[1];
            expect(cmd).toBe('npx');
            expect(args).toEqual(['ocr', 'review', '--from', 'main', '--to', 'feature']);
        });

        it('should correctly execute the reviewCommit command', async () => {
            spawn.mockImplementation(() => {
                return createMockChildProcess('Open code review complete for commit', '', 0);
            });

            const output = await openCodeReviewService.reviewCommit('a1b2c3d');
            expect(output).toBe('Open code review complete for commit');
            expect(spawn).toHaveBeenCalledTimes(1);

            const lastCall = spawn.mock.calls[0];
            const cmd = lastCall[0];
            const args = lastCall[1];
            expect(cmd).toBe('npx');
            expect(args).toEqual(['ocr', 'review', '--commit', 'a1b2c3d']);
        });
    });

    describe('codeReviewWorkerProcessor', () => {
        it('should execute openCodeReview and embed results in LLM prompt when useOcr is true', async () => {
            spawn.mockImplementation(() => {
                return createMockChildProcess('CRITICAL: hardcoded password found', '', 0);
            });

            const mockReason = vi.spyOn(aiProvider, 'reason').mockResolvedValue(JSON.stringify({
                score: 40,
                critical: ['Found hardcoded password'],
                improvements: [],
                style: [],
                summary: 'Rejected due to security'
            }));

            const job = {
                id: 'job-123',
                data: {
                    code: 'const pass = "12345";',
                    filePath: 'src/index.js',
                    context: 'Security audit',
                    useOcr: true
                }
            };

            const result = await codeReviewWorkerProcessor(job);
            
            expect(spawn).toHaveBeenCalledTimes(1);
            expect(mockReason).toHaveBeenCalledTimes(1);

            const sentPrompt = mockReason.mock.calls[0][0];
            expect(sentPrompt).toContain('ALIBABA OPEN-CODE-REVIEW FINDINGS');
            expect(sentPrompt).toContain('CRITICAL: hardcoded password found');
            expect(result.review.score).toBe(40);
        });

        it('should bypass openCodeReview when useOcr is false', async () => {
            const mockReason = vi.spyOn(aiProvider, 'reason').mockResolvedValue(JSON.stringify({
                score: 95,
                critical: [],
                improvements: [],
                style: [],
                summary: 'Approved'
            }));

            const job = {
                id: 'job-124',
                data: {
                    code: 'console.log("hello");',
                    filePath: 'src/index.js',
                    context: 'Routine check',
                    useOcr: false
                }
            };

            const result = await codeReviewWorkerProcessor(job);

            expect(spawn).not.toHaveBeenCalled();
            expect(mockReason).toHaveBeenCalledTimes(1);

            const sentPrompt = mockReason.mock.calls[0][0];
            expect(sentPrompt).not.toContain('ALIBABA OPEN-CODE-REVIEW FINDINGS');
            expect(result.review.score).toBe(95);
        });
    });
});
