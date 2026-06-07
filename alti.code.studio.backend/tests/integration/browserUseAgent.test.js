import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import { BrowserUseAgentService } from '../../src/app/modules/browserUseAgent/browserUseAgent.service.js';

vi.mock('axios');

describe('BrowserUseAgent Service Integration', () => {
    it('should call runBrowserTask and correctly post task description to the python daemon', async () => {
        const mockTaskId = 'test-uuid-1234';
        axios.post.mockResolvedValue({
            data: { taskId: mockTaskId, status: 'running' }
        });

        const result = await BrowserUseAgentService.runBrowserTask('Search for open-source agents');

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/v1/browser/run'),
            expect.objectContaining({ task: 'Search for open-source agents' })
        );
        expect(result).toEqual({ taskId: mockTaskId, status: 'running' });
    });

    it('should call getBrowserTaskStatus and fetch correct task status from the python daemon', async () => {
        const mockTaskId = 'test-uuid-1234';
        const mockResponse = {
            status: 'completed',
            result: 'Search complete. 3 results found.',
            history: [{ action: 'navigate', result: 'success' }],
            error: null
        };
        axios.get.mockResolvedValue({ data: mockResponse });

        const result = await BrowserUseAgentService.getBrowserTaskStatus(mockTaskId);

        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining(`/api/v1/browser/status/${mockTaskId}`)
        );
        expect(result).toEqual(mockResponse);
    });
});
