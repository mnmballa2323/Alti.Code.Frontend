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
<<<<<<< HEAD
    const result = await GoogleGenAiService.generateContent(req.body.prompt, req.body.model);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Content generated successfully via Gemini',
=======
    // 🛡️ Hard Law: Strictly ignore any incoming 'model' param and force Gemini 3.1 Pro
    const result = await GoogleGenAiService.generateContent(req.body.prompt);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Content generated successfully via Gemini 3.1 Pro',
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        data: result,
    });
});

const chat = catchAsync(async (req, res) => {
<<<<<<< HEAD
    const result = await GoogleGenAiService.chatSession(req.body.history, req.body.message, req.body.model);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chat response received from Gemini',
=======
    // 🛡️ Hard Law: Strictly ignore any incoming 'model' param and force Gemini 3.1 Pro
    const result = await GoogleGenAiService.chatSession(req.body.history, req.body.message);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Chat response received from Gemini 3.1 Pro',
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
        data: result,
    });
});

<<<<<<< HEAD
=======

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
export const GoogleGenAiController = {
    generate,
    chat
};
