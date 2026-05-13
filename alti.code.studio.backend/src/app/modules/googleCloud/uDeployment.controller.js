import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { uDeploymentService } from './uDeployment.service.js';

const autoDeploy = catchAsync(async (req, res) => {
    const { platform, config } = req.body;
    
    if (!platform || !config) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'platform and config are required.' });
    }

    const result = await uDeploymentService.executeAutoDeploy(platform, config);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Universal Deployment executed.',
        data: result,
    });
});

const rollBack = catchAsync(async (req, res) => {
    const result = await uDeploymentService.rollBackToStable();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud rollback executed.',
        data: result,
    });
});

export const UDeploymentController = {
    autoDeploy,
    rollBack
};
