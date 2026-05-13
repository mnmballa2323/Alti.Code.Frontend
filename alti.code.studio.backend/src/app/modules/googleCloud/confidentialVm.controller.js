import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { confidentialVmService } from './confidential_vm.service.js';

const spawnConfidentialWorker = catchAsync(async (req, res) => {
    const { instanceName } = req.body;
    
    if (!instanceName) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'instanceName is required.' });
    }

    const operationName = await confidentialVmService.spawnConfidentialWorker(instanceName);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `AMD SEV Confidential VM provisioning initiated. Silicon-level encryption activated.`,
        data: { operationName },
    });
});

export const ConfidentialVmController = {
    spawnConfidentialWorker
};
