import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { documentAiService } from './document_ai.service.js';

const parseDocument = catchAsync(async (req, res) => {
    // In reality this would parse a multipart/form-data PDF.
    // Simplifying to a base64 string for architectural completeness.
    const { documentBase64, mimeType } = req.body;
    
    if (!documentBase64) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'documentBase64 is required.' });
    }

    const fileBuffer = Buffer.from(documentBase64, 'base64');
    const text = await documentAiService.extractArchitectureDiagram(fileBuffer, mimeType || 'application/pdf');

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Document AI structural parsing completed.',
        data: { text },
    });
});

export const DocumentAiController = {
    parseDocument
};
