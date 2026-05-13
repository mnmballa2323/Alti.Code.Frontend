import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { assetService } from './asset.service.js';

const searchIAMPolicy = catchAsync(async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Query parameter is required.' });
    }

    const policies = await assetService.searchIAMPolicy(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud IAM Policies retrieved.',
        data: policies,
    });
});

const searchResources = catchAsync(async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Query parameter is required.' });
    }

    const resources = await assetService.searchResources(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Resources retrieved.',
        data: resources,
    });
});

export const AssetController = {
    searchIAMPolicy,
    searchResources
};
