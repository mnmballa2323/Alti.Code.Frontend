import express from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GeminiExtensionService } from './geminiExtension.service.js';

const router = express.Router();

router.get('/list', catchAsync(async (req, res) => {
    const data = await GeminiExtensionService.listExtensions();
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Extensions listed.', data });
}));

router.post('/install', catchAsync(async (req, res) => {
    const { githubUrl } = req.body;
    if (!githubUrl) return sendResponse(res, { statusCode: httpStatus.BAD_REQUEST, success: false, message: 'githubUrl is required.', data: null });
    const data = await GeminiExtensionService.installExtension(githubUrl);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Extension installed.', data });
}));

router.post('/invoke', catchAsync(async (req, res) => {
    const { extensionName, inputArgs } = req.body;
    if (!extensionName) return sendResponse(res, { statusCode: httpStatus.BAD_REQUEST, success: false, message: 'extensionName is required.', data: null });
    const data = await GeminiExtensionService.invokeExtension(extensionName, inputArgs || []);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Extension invoked.', data });
}));

router.delete('/uninstall/:name', catchAsync(async (req, res) => {
    const data = await GeminiExtensionService.uninstallExtension(req.params.name);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Extension uninstalled.', data });
}));

export const geminiExtensionsRoutes = router;
