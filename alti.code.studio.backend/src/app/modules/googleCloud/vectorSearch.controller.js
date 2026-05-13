import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { vertexVectorSearch } from './vectorSearch.service.js';

const upsertContext = catchAsync(async (req, res) => {
    const { datapoints } = req.body;
    
    if (!datapoints || !Array.isArray(datapoints)) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'datapoints array is required.' });
    }

    const result = await vertexVectorSearch.upsertEmbeddings(datapoints);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Context shards upserted to Google Vertex AI Vector Search.',
        data: result,
    });
});

const queryContext = catchAsync(async (req, res) => {
    const { queryEmbedding, topK } = req.body;
    
    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'queryEmbedding array is required.' });
    }

    const neighbors = await vertexVectorSearch.queryContext(queryEmbedding, topK || 10);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Semantic lookup completed via Google Vertex AI Matching Engine.',
        data: { neighbors },
    });
});

export const VectorSearchController = {
    upsertContext,
    queryContext
};
