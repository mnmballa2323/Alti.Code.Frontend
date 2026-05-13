import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { alloyDbService } from './alloydb.service.js';

const hybridSearch = catchAsync(async (req, res) => {
    const { embedding, fileExtension } = req.body;
    
    if (!embedding || !Array.isArray(embedding)) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'embedding vector array is required.' });
    }

    const results = await alloyDbService.executeHybridSearch(embedding, fileExtension || '.js');

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google AlloyDB Hybrid Relational/Semantic RAG search completed.',
        data: { results },
    });
});

export const AlloyDbController = {
    hybridSearch
};
