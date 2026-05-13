import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { spannerGraphService } from './spanner_graph.service.js';

const traverseAstGraph = catchAsync(async (req, res) => {
    const { startNodeId, depth } = req.body;
    
    if (!startNodeId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'startNodeId is required.' });
    }

    const executionPath = await spannerGraphService.executeAstGraphTraversal(startNodeId, depth || 3);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Spanner Native GQL Graph Traversal completed.',
        data: { executionPath },
    });
});

const ingestAstGraph = catchAsync(async (req, res) => {
    const { sourceCode, fileName } = req.body;
    
    if (!sourceCode || !fileName) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'sourceCode and fileName are required.' });
    }

    const ingestionResult = await spannerGraphService.ingestSourceCodeToGraph(sourceCode, fileName);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Source code successfully parsed by Vertex AI and ingested into Google Spanner Graph.',
        data: ingestionResult,
    });
});

export const SpannerGraphController = {
    traverseAstGraph,
    ingestAstGraph
};
