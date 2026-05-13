import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { cloudRouterService } from './cloud_router.service.js';

const establishRoute = catchAsync(async (req, res) => {
    const { targetIpRange } = req.body;
    
    if (!targetIpRange) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'targetIpRange is required.' });
    }

    const established = await cloudRouterService.establishFiberOpticIngestionRoute(targetIpRange);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Router BGP Peering requested.',
        data: { established },
    });
});

export const CloudRouterController = {
    establishRoute
};
