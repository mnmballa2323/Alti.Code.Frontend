import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { dataCatalogService } from './data_catalog.service.js';

const checkGovernance = catchAsync(async (req, res) => {
    const { filePath, fileContent } = req.body;
    
    if (!filePath || !fileContent) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'filePath and fileContent are required.' });
    }

    const governanceCheck = await dataCatalogService.governFileIngestion(filePath, fileContent);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Data Catalog Governance check completed.',
        data: governanceCheck,
    });
});

export const GovernanceController = {
    checkGovernance
};
