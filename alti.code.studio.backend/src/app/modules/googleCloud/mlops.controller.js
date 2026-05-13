import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { vertexEval } from './eval.service.js';
import { featureStoreService } from './feature_store.service.js';

const evaluateOutput = catchAsync(async (req, res) => {
    const { agentId, prompt, output } = req.body;
    
    if (!agentId || !prompt || !output) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'agentId, prompt, and output are required.' });
    }

    const evaluation = await vertexEval.evaluateOutput(agentId, prompt, output);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Vertex AI Agentic Evaluation completed.',
        data: evaluation,
    });
});

const getPrecomputedFeatures = catchAsync(async (req, res) => {
    const { entityId } = req.query;
    
    if (!entityId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'entityId is required.' });
    }

    const features = await featureStoreService.getPrecomputedEmbedding(entityId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Vertex AI Feature Store retrieval successful.',
        data: { features },
    });
});

export const MlopsController = {
    evaluateOutput,
    getPrecomputedFeatures
};
