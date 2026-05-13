/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GoogleGenAiService } from './googleGenAi.service.js';

const generate = catchAsync(async (req, res) => {
    const result = await GoogleGenAiService.generateContent(req.body.prompt, req.body.model);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Content generated successfully via Gemini',
        data: result,
    });
});

const chat = catchAsync(async (req, res) => {
    const result = await GoogleGenAiService.chatSession(req.body.history, req.body.message, req.body.model);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chat response received from Gemini',
        data: result,
    });
});

export const GoogleGenAiController = {
    generate,
    chat
};
