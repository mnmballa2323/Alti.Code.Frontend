import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { dataCatalogService } from './data_catalog.service.js';

const governFile = catchAsync(async (req, res) => {
    const { filePath, fileContent } = req.body;
    
    if (!filePath || !fileContent) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'filePath and fileContent are required.' });
    }

    const result = await dataCatalogService.governFileIngestion(filePath, fileContent);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Data Catalog governance check completed.',
        data: result,
    });
});

export const DataCatalogController = {
    governFile
};
