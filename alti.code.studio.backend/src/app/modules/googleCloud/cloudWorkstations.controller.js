import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { cloudWorkstationsService } from './cloudWorkstations.service.js';

const provision = catchAsync(async (req, res) => {
    const { workstationId } = req.body;
    
    if (!workstationId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'workstationId is required.' });
    }

    const hostUrl = await cloudWorkstationsService.provisionWorkstation(workstationId);

    if (!hostUrl) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to provision workstation.' });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Workstation successfully provisioned.',
        data: { url: hostUrl },
    });
});

export const CloudWorkstationsController = {
    provision
};
