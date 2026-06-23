import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autonomicService } from './autonomic.service.js';
import { astService } from '../../../shared/ast.service.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';

vi.mock('../../../shared/ast.service.js');
vi.mock('../gemini/gemini.service.js');
vi.mock('fs/promises');

vi.mock('../../../shared/redis.client.js', () => ({
    redisClient: {
        setnx: vi.fn().mockResolvedValue(true),
        del: vi.fn().mockResolvedValue(1),
    }
}));

describe('Predictive Autonomic Refactoring (Phase 20 - Proactive Surgeon)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Spy on the mock git commit method
        vi.spyOn(autonomicService, '_applyAndStageRepair').mockResolvedValue({
            filePath: '/mock/repo/bad_spaghetti_file.js',
            branchName: 'autonomic/flatten-complexity-1234'
        });
        // Set unit test threshold
        autonomicService.COMPLEXITY_THRESHOLD = 5;
    });

    it('should proactively scan files, identify high complexity via AST, and automatically draft a PR patch', async () => {

        // Setup: We feed it two mock files. One is good (O(1)), one is terrible (O(N^3) spaghetti).
        const filesToScan = [
            '/mock/repo/good_file.js',
            '/mock/repo/bad_spaghetti_file.js'
        ];

        // Mock reading the files
        fs.readFile.mockImplementation(async (path) => {
            if (path.includes('good_file')) return `const a = 1;`;
            if (path.includes('bad_spaghetti_file')) return `let x = 0; for(let i=0; i<10; i++) { for(let j=0; j<10; j++) { if(true){ if(true){ x++; } } } }`;
        });

        // Mock the AST module scoring them structurally
        astService.calculateComplexity.mockImplementation((sourceCode) => {
            if (sourceCode.includes('a = 1')) return 1; // Good file
            return 8; // Bad file triggers the COMPLEXITY_THRESHOLD of 5
        });

        // Mock the AI aggressively refactoring the bad file
        GeminiAiService.generateContent.mockResolvedValueOnce('const x = 100; // Refactored to O(1)');

        // Run the cron-job sweep
        const result = await autonomicService.commenceProactiveSweep(filesToScan);

        // ASSERTIONS
        // It should have read both files
        expect(fs.readFile).toHaveBeenCalledTimes(2);

        // It should have calculated complexity on both files
        expect(astService.calculateComplexity).toHaveBeenCalledTimes(2);

        // It should have detected exactly 1 file over the threshold (score 8 vs threshold 5)
        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(1);

        // It should have dynamically generated a branch & commit for the bad file
        expect(autonomicService._applyAndStageRepair).toHaveBeenCalledTimes(1);
        expect(autonomicService._applyAndStageRepair.mock.calls[0][0]).toContain('bad_spaghetti_file.js');

        // It should return 1 debt eliminated
        expect(result.eliminated).toBe(1);
    });

});
