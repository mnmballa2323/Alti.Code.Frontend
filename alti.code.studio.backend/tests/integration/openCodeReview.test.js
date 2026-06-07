global.self = global;
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exec } from 'child_process';
import { openCodeReviewService } from '../../src/app/modules/codeReviewAgent/openCodeReview.service.js';
import { codeReviewWorkerProcessor } from '../../src/app/modules/codeReviewAgent/codeReview.worker.js';
import { aiProvider } from '../../src/app/modules/ai/ai.provider.js';

vi.mock('child_process', () => {
    return {
        exec: vi.fn()
    };
});

describe('OpenCodeReview Integration & Worker Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe('OpenCodeReviewService', () => {
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
            expect(opts.env.OCR_LLM_MODEL).toBe('gemini-experimental');
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

    describe('codeReviewWorkerProcessor', () => {
        it('should execute openCodeReview and embed results in LLM prompt when useOcr is true', async () => {
            exec.mockImplementation((cmd, opts, callback) => {
                callback(null, 'CRITICAL: hardcoded password found', '');
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
            
            expect(exec).toHaveBeenCalledTimes(1);
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

            expect(exec).not.toHaveBeenCalled();
            expect(mockReason).toHaveBeenCalledTimes(1);

            const sentPrompt = mockReason.mock.calls[0][0];
            expect(sentPrompt).not.toContain('ALIBABA OPEN-CODE-REVIEW FINDINGS');
            expect(result.review.score).toBe(95);
        });
    });
});
