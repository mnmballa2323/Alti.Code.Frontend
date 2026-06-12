import { vectorStoreService } from './vector.store.js';
import { ragService } from './rag.service.js';
import { memoryPalaceService } from './memory_palace.service.js';
import { mimoDreamService } from './mimo_dream.service.js';
import { mimoDistillerService } from './mimo_distiller.service.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';

export class MemoryController {
    /**
     * GET /api/v1/memory
     * Fetches recent embeddings and metadata for the Dashboard.
     */
    static listMemory = catchAsync(async (req, res) => {
        const limit = parseInt(req.query.limit, 10) || 50;
        const memoryRecords = await vectorStoreService.list(limit);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Enterprise Memory records retrieved successfully',
            data: memoryRecords,
        });
    });

    /**
     * POST /api/v1/memory/rag/ingest
     */
    static ragIngest = catchAsync(async (req, res) => {
        const { filePath, meta } = req.body;
        await ragService.ingestFile(filePath, meta);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'File ingested into RAG Vector Store successfully.',
        });
    });

    /**
     * POST /api/v1/memory/rag/query
     */
    static ragQuery = catchAsync(async (req, res) => {
        const { query, topK } = req.body;
        const answer = await ragService.query(query, topK);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'RAG Query completed',
            data: { answer },
        });
    });

    /**
     * POST /api/v1/memory/palace/index
     */
    static palaceIndex = catchAsync(async (req, res) => {
        const docId = await memoryPalaceService.indexSprintMemory(req.body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Episodic memory indexed to Memory Palace.',
            data: { docId },
        });
    });

    /**
     * POST /api/v1/memory/palace/search
     */
    static palaceSearch = catchAsync(async (req, res) => {
        const { query, topK } = req.body;
        const results = await memoryPalaceService.searchMemory(query, topK);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Memory Palace search completed',
            data: results,
        });
    });

    /**
     * POST /api/v1/memory/mimo/dream
     */
    static mimoDream = catchAsync(async (req, res) => {
        const { project } = req.body;
        const result = await mimoDreamService.dream(project);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'MimoDream self-evolution compaction completed successfully.',
            data: result,
        });
    });

    /**
     * POST /api/v1/memory/mimo/distill
     */
    static mimoDistill = catchAsync(async (req, res) => {
        const { taskDescription, logs, targetId } = req.body;
        const result = await mimoDistillerService.distill(taskDescription, logs, targetId);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'MimoDistiller dynamic agent compiled and distilled successfully.',
            data: result,
        });
    });
}
