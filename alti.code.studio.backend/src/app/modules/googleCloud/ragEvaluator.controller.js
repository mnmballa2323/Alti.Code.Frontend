import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { ragEvaluatorService } from './rag_evaluator.service.js';

const evaluateRetrieval = catchAsync(async (req, res) => {
    const { prompt, retrievedContext, groundTruthContext } = req.body;
    
    if (!prompt || !retrievedContext || !groundTruthContext) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'prompt, retrievedContext, and groundTruthContext are required.' });
    }

    const score = await ragEvaluatorService.evaluateRetrievalQuality(prompt, retrievedContext, groundTruthContext);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Vertex AI RAG Evaluation completed.',
        data: { score },
    });
});

export const RagEvaluatorController = {
    evaluateRetrieval
};
