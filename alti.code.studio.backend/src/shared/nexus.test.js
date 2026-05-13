import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nexusAgent } from './nexus.agent.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

vi.mock('../app/modules/gemini/gemini.service.js');
vi.mock('fs/promises');

describe('Cross-Repository Swarm Coordination (Phase 26 - The Nexus)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should coordinate atomic changes across frontend and backend repositories simultaneously', async () => {

        // Mock the Backend Swarm Agent Generation
        GeminiAiService.generateContent.mockResolvedValueOnce(JSON.stringify({
            file: 'src/routes/stripe.js',
            content: 'const backend = true;'
        }));

        // Mock the Frontend Swarm Agent Generation
        GeminiAiService.generateContent.mockResolvedValueOnce(JSON.stringify({
            file: 'src/components/Checkout.jsx',
            content: 'const frontend = true;'
        }));

        const mockGlobalIntent = "Implement Stripe cross-stack";
        const targetRepos = [
            '/mock/repos/backend-api',
            '/mock/repos/frontend-ui'
        ];

        const result = await nexusAgent.executeCrossRepoFeature(mockGlobalIntent, targetRepos);

        // ASSERTIONS

        // 1. Both sub-agents should have been dispatched via Gemini
        expect(GeminiAiService.generateContent).toHaveBeenCalledTimes(2);

        // 2. The backend repository should have been modified
        expect(fs.writeFile).toHaveBeenCalledWith(
            path.normalize('/mock/repos/backend-api/src/routes/stripe.js'),
            'const backend = true;',
            'utf8'
        );

        // 3. The frontend repository should have been modified
        expect(fs.writeFile).toHaveBeenCalledWith(
            path.normalize('/mock/repos/frontend-ui/src/components/Checkout.jsx'),
            'const frontend = true;',
            'utf8'
        );

        // 4. The atomic lock should have succeeded
        expect(result.success).toBe(true);
        expect(result.swarm_payloads).toHaveLength(2);

        const modifiedRepos = result.swarm_payloads.map(p => p.repo);
        expect(modifiedRepos).toContain('backend-api');
        expect(modifiedRepos).toContain('frontend-ui');
    });

});
