import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { knowledgeCatalogService } from './knowledgeCatalog.service.js';
import { knowledgeCatalogEnricher } from './knowledgeCatalog.enricher.js';

const initBundle = catchAsync(async (req, res) => {
    const result = await knowledgeCatalogService.initLocalBundle();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Local OKF Knowledge Catalog bundle initialized successfully.',
        data: result,
    });
});

const syncBundle = catchAsync(async (req, res) => {
    const { action } = req.body;
    let result;

    if (action === 'push') {
        result = await knowledgeCatalogService.pushToDataplex();
    } else {
        result = await knowledgeCatalogService.pullFromDataplex();
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: result.success,
        message: `Knowledge Catalog synchronization (${action || 'pull'}) completed.`,
        data: result,
    });
});

const enrichBundle = catchAsync(async (req, res) => {
    const result = await knowledgeCatalogEnricher.enrichBundle();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Autonomous Knowledge Catalog enrichment complete.',
        data: result,
    });
});

const queryCatalog = catchAsync(async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'query is required.' });
    }

    // Retrieve local bundle lists and filter/match concepts based on query
    const conceptIds = knowledgeCatalogService.listLocalBundle();
    const matched = [];

    for (const conceptId of conceptIds) {
        const concept = knowledgeCatalogService.getLocalConcept(conceptId);
        if (!concept) continue;

        const lowerQuery = query.toLowerCase();
        const matchesTitle = concept.frontmatter.title?.toLowerCase().includes(lowerQuery);
        const matchesDesc = concept.frontmatter.description?.toLowerCase().includes(lowerQuery);
        const matchesBody = concept.body.toLowerCase().includes(lowerQuery);

        if (matchesTitle || matchesDesc || matchesBody) {
            matched.push({
                id: conceptId,
                frontmatter: concept.frontmatter,
                body: concept.body
            });
        }
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Knowledge Catalog query results retrieved.',
        data: matched,
    });
});

export const KnowledgeCatalogController = {
    initBundle,
    syncBundle,
    enrichBundle,
    queryCatalog
};
