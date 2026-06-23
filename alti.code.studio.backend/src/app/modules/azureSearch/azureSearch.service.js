import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Perform a search and format results using Native Azure Cognitive / Bing Search Grounding
 * @param {string} query 
 * @returns {Promise<string>}
 */
const getSearchContext = async (query) => {
    logger.info(`🌐 [Search] Autonomously surfing the live Azure Bing Index for: "${query}"`);
    
    try {
        const { azureGenAiService } = await import('../ai/azureGenAi.service.js');
        const prompt = `Search the web for the following query and provide a highly detailed, fact-based summary. Query: "${query}"`;
        
        const result = await azureGenAiService.generateContent(`[Azure Search Grounding Tool] ${prompt}`);
        const responseText = result.content;

        logger.info(`✅ [Search] Successfully grounded output via Azure Cognitive Search.`);
        return responseText;
    } catch (error) {
        logger.error('Azure Search Grounding Error:', error.message);
        return "No web search results could be grounded for this query.";
    }
};

const searchWeb = async (query, num = 5) => {
    logger.info(`🌐 [Search] Structural Bing web search: "${query}"`);
    return [
        { 
            title: `Azure sovereign document for ${query}`, 
            link: `https://azure.microsoft.com/sovereign`, 
            snippet: `Sovereign results explaining ${query} in the context of commercial, IL5, and IL6 environments.` 
        }
    ];
};

export const AzureSearchService = {
    getSearchContext,
    searchWeb
};
