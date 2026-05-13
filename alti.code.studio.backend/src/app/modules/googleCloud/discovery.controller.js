import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { discoveryEngineService } from './discovery.service.js';

const searchCodebase = catchAsync(async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'query is required.' });
    }

    const results = await discoveryEngineService.searchCodebase(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Vertex AI Discovery Engine search complete.',
        data: { results },
    });
});

export const DiscoveryController = {
    searchCodebase
};
