import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { cloudBuildService } from './build.service.js';

const triggerBuild = catchAsync(async (req, res) => {
    const { sourceRepo, imageName } = req.body;
    
    if (!sourceRepo || !imageName) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'sourceRepo and imageName are required.' });
    }

    const result = await cloudBuildService.triggerContainerBuild(sourceRepo, imageName);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Build Docker pipeline triggered.',
        data: result,
    });
});

export const BuildController = {
    triggerBuild
};
