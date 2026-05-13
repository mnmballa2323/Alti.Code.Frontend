import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { workspaceService } from './workspace.service.js';

const readTechnicalSpec = catchAsync(async (req, res) => {
    const { documentId } = req.body;
    
    if (!documentId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'documentId is required.' });
    }

    const content = await workspaceService.readTechnicalSpec(documentId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Doc technical spec read successfully.',
        data: { content },
    });
});

const sendEmailReport = catchAsync(async (req, res) => {
    const { subject, htmlBody } = req.body;
    
    if (!subject || !htmlBody) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'subject and htmlBody are required.' });
    }

    const result = await workspaceService.emailAdministrator(subject, htmlBody);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Email report dispatched via Google Workspace Gmail API.',
        data: result,
    });
});

export const WorkspaceController = {
    readTechnicalSpec,
    sendEmailReport
};
