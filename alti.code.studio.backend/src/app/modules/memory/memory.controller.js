import { vectorStoreService } from './vector.store.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';

export class MemoryController {
    /**
     * GET /api/v1/memory
     * Fetches recent embeddings and metadata for the Dashboard.
     */
    static listMemory = catchAsync(async (req, res) => {
        const limit = parseInt(req.query.limit, 10) || 50;
        const memoryRecords = await vectorStoreService.list(limit);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Enterprise Memory records retrieved successfully',
            data: memoryRecords,
        });
    });
}
