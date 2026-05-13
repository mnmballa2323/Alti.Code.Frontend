import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const CRAWL4AI_API_URL = config.crawl4ai_url || 'http://localhost:3019';

const crawlAndExtract = async (url, extractionStrategy = 'markdown') => {
    try {
        const response = await axios.post(`${CRAWL4AI_API_URL}/api/v1/crawl`, {
            url: url,
            strategy: extractionStrategy,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to scrape URL with Crawl4AI: ${error.message}`
        );
    }
};

export const Crawl4AiAgentService = {
    crawlAndExtract,
};
