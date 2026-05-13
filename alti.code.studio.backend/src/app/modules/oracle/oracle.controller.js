import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { oracleService } from './oracle.service.js';

const analyzeQuery = catchAsync(async (req, res) => {
    const { sql } = req.body;
    const result = await oracleService.analyzeQuery(sql);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Query analysis complete',
        data: result,
    });
});

const detectNPlusOne = catchAsync(async (req, res) => {
    const { filePath } = req.body;
    const result = await oracleService.detectNPlusOne(filePath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'N+1 analysis complete',
        data: result,
    });
});

export const oracleController = {
    analyzeQuery,
    detectNPlusOne
};
