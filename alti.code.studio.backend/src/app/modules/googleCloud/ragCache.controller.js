import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { ragCacheService } from './rag_cache.service.js';

const getCache = catchAsync(async (req, res) => {
    const { promptHash } = req.query;
    
    if (!promptHash) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'promptHash query parameter is required.' });
    }

    const contextData = await ragCacheService.getCachedContext(promptHash);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Memorystore cache retrieved.',
        data: { contextData },
    });
});

const setCache = catchAsync(async (req, res) => {
    const { promptHash, contextData } = req.body;
    
    if (!promptHash || !contextData) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'promptHash and contextData are required.' });
    }

    await ragCacheService.setCachedContext(promptHash, contextData);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Memorystore cache set.',
    });
});

export const RagCacheController = {
    getCache,
    setCache
};
