import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { githubDocsService } from './githubDocs.service.js';

export class GithubDocsController {
    /**
     * POST /api/v1/githubDocs/sync
     * Manually triggers the documentation sync process in the background.
     */
    static triggerSync = catchAsync(async (req, res) => {
        // Run in background to prevent request timeout
        githubDocsService.syncDocs().catch(err => {
            console.error('[GitHub Docs] Background sync error:', err);
        });

        sendResponse(res, {
            statusCode: httpStatus.ACCEPTED,
            success: true,
            message: 'GitHub developer documentation sync initiated in the background.',
            data: githubDocsService.getStatus()
        });
    });

    /**
     * GET /api/v1/githubDocs/status
     * Returns the real-time progress and stats of the crawler.
     */
    static getStatus = catchAsync(async (req, res) => {
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'GitHub documentation sync status retrieved successfully.',
            data: githubDocsService.getStatus()
        });
    });

    /**
     * POST /api/v1/githubDocs/search
     * Performs a semantic similarity search across ingested developer resources.
     */
    static search = catchAsync(async (req, res) => {
        const { query, limit } = req.body;
        if (!query) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'A search query string is required.'
            });
        }

        const answer = await githubDocsService.searchDocs(query, limit);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'GitHub documentation search completed.',
            data: { answer }
        });
    });

    /**
     * POST /api/v1/githubDocs/cancel
     * Cancels the active documentation sync process.
     */
    static cancelSync = catchAsync(async (req, res) => {
        const cancelled = githubDocsService.cancelSync();

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: cancelled 
                ? 'GitHub documentation sync cancellation requested successfully.' 
                : 'No active sync session was found to cancel.',
            data: githubDocsService.getStatus()
        });
    });
}
