import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { librarianService } from './librarian.service.js';
import { wikiService } from '../docs/wiki.service.js';

const documentFile = catchAsync(async (req, res) => {
    const { filePath } = req.body;
    const result = await librarianService.documentFile(filePath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'File documented successfully',
        data: result,
    });
});

const updateReadme = catchAsync(async (req, res) => {
    const { dirPath } = req.body;
    const result = await librarianService.updateReadme(dirPath);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'README updated successfully',
        data: result,
    });
});

const generateDocsSite = catchAsync(async (req, res) => {
    const result = await wikiService.generateDocsSite();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Documentation site generated successfully',
        data: result,
    });
});

const generateADR = catchAsync(async (req, res) => {
    const { title, context } = req.body;
    const result = await wikiService.generateADR(title, context);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'ADR generated successfully',
        data: result,
    });
});

export const librarianController = {
    documentFile,
    updateReadme,
    generateDocsSite,
    generateADR
};
