import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { CodeAssistService } from './codeAssist.service.js';

const performStructuralRefactor = catchAsync(async (req, res) => {
    const { targetRepo, instruction } = req.body;
    
    if (!targetRepo || !instruction) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'targetRepo and instruction are required.' });
    }

    const optimizedResponse = await CodeAssistService.performStructuralRefactor(targetRepo, instruction);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Gemini Code Assist structural refactor generated and optimized via Closure Compiler.',
        data: { optimizedResponse },
    });
});

export const CodeAssistController = {
    performStructuralRefactor
};
