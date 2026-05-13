import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { CloudLoggingService } from './logging.service.js';

const auditEvent = catchAsync(async (req, res) => {
    const { logName, entry, severity } = req.body;
    
    if (!logName || !entry) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'logName and entry are required.' });
    }

    await CloudLoggingService.writeAuditLog(logName, entry, severity || 'NOTICE');

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Event successfully written to Google Cloud Logging.',
    });
});

export const LoggingController = {
    auditEvent
};
