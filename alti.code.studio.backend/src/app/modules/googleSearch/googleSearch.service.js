import { google } from 'googleapis';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Perform a search and format results using Native Vertex AI Grounding
 * @param {string} query 
 * @returns {Promise<string>}
 */
const getSearchContext = async (query) => {
    logger.info(`🌐 [Search] Autonomously surfing the live Google Index for: "${query}"`);
    
    try {
        // Dynamically import the centralized vertexService to avoid circular dependencies
        const { vertexService } = await import('../ai/vertex.service.js');
        
        // Native Google Search Grounding natively binds the live Google Index to the LLM
        // This completely skips manual HTML parsing and prevents hallucination.
        const prompt = `Search the web for the following query and provide a highly detailed, fact-based summary. Query: "${query}"`;
        
        // Note: Real Vertex AI usage requires setting tools on the generativeModel.
        // For dynamic usage via our service wrapper, we assume the Vertex model is 
        // pre-configured for it or we use the underlying SDK directly here.
        if (vertexService.isMockMode || !vertexService.generativeModel) {
            return vertexService.mockGenerate(`[Google Grounding Tool] ${prompt}`);
        }

        const request = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            tools: [{ googleSearchRetrieval: {} }]
        };

        const result = await vertexService.generativeModel.generateContent(request);
        const responseText = result.response.candidates[0].content.parts[0].text;

        logger.info(`✅ [Search] Successfully grounded output via Vertex AI Search.`);
        return responseText;
    } catch (error) {
        logger.error('Google Search Grounding Error:', error.message);
        return "No web search results could be grounded for this query.";
    }
};

export const GoogleSearchService = {
    getSearchContext
};
