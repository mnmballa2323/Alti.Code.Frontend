import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { AzureSearchService } from './azureSearch.service.js';

const search = catchAsync(async (req, res) => {
    const { q, num } = req.query;
    const result = await AzureSearchService.searchWeb(q, num);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Search results retrieved successfully',
        data: result,
    });
});

const getContext = catchAsync(async (req, res) => {
    const { q } = req.query;
    const result = await AzureSearchService.getSearchContext(q);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Search context retrieved successfully',
        data: result,
    });
});

export const AzureSearchController = {
    search,
    getContext
};
