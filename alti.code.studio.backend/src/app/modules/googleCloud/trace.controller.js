import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { traceService } from './trace.service.js';

const traceOperation = catchAsync(async (req, res) => {
    const { operationName } = req.body;
    
    if (!operationName) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'operationName is required.' });
    }

    // Dummy block to trace
    const result = await traceService.traceCognitiveOperation(operationName, async () => {
        return { tracked: true, timestamp: Date.now() };
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Trace nanosecond telemetry captured.',
        data: result,
    });
});

export const TraceController = {
    traceOperation
};
