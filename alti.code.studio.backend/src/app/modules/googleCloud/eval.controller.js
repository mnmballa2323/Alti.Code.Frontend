import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { vertexEval } from './eval.service.js';

const evaluateOutput = catchAsync(async (req, res) => {
    const { agentId, prompt, output } = req.body;
    
    if (!agentId || !prompt || !output) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'agentId, prompt, and output are required.' });
    }

    const result = await vertexEval.evaluateOutput(agentId, prompt, output);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Vertex AI Model Evaluation completed.',
        data: result,
    });
});

export const EvalController = {
    evaluateOutput
};
