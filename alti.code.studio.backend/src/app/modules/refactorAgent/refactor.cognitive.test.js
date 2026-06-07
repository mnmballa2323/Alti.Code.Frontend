/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { refactorWorkerProcessor } from './refactor.worker.js';

// MOCKS
vi.mock('../../../shared/logger.js', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    }
}));

vi.mock('../gemini/gemini.service.js', () => ({
    GeminiAiService: {
        generateContent: vi.fn().mockResolvedValue('```javascript\nconst a = 1;\n```')
    }
}));

vi.mock('../memory/vector.store.js', () => ({
    vectorStoreService: {
        search: vi.fn().mockResolvedValue({ ids: [['doc1']], documents: [['Example code']] }),
        add: vi.fn().mockResolvedValue('doc_new')
    }
}));

vi.mock('./treeSitter.service.js', () => ({
    treeSitterService: {
        init: vi.fn().mockResolvedValue(),
        parse: vi.fn().mockResolvedValue(true)
    }
}));

describe('Cognitive Refactor Worker', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('should execute Recall -> Reason -> Verify -> Memorize flow', async () => {
        const job = {
            id: 'job_cognitive_1',
            data: {
                codeSnippet: 'var x = 1;',
                instruction: 'Use const',
                userId: 'user1',
                sessionId: 'sess1'
            }
        };

        const result = await refactorWorkerProcessor(job);

        // 1. RECALL
        const { vectorStoreService } = await import('../memory/vector.store.js');
        expect(vectorStoreService.search).toHaveBeenCalledWith('Use const', 3);

        // 2. REASON
        const { GeminiAiService } = await import('../gemini/gemini.service.js');
        expect(GeminiAiService.generateContent).toHaveBeenCalled();

        // 3. VERIFY
        const { treeSitterService } = await import('./treeSitter.service.js');
        expect(treeSitterService.parse).toHaveBeenCalled();

        // 4. MEMORIZE
        expect(vectorStoreService.add).toHaveBeenCalled();

        // Result check
        expect(result.refactored).toContain('const a = 1;');
    });
});
