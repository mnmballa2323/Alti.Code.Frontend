import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const SEARXNG_API_URL = config.searxng_url || 'http://localhost:8081';

const searchWeb = async (queryText, categories = 'general', language = 'en') => {
    try {
        // SearXNG exposes a search endpoint that aggregates 70+ engines privately
        const response = await axios.get(`${SEARXNG_API_URL}/search`, {
            params: {
                q: queryText,
                categories: categories,
                language: language,
                format: 'json',
            },
            headers: {
                // Prevents some engines from blocking the scraper
                'User-Agent': 'Mozilla/5.0 Inso Code Hive Mind',
            },
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to execute private metasearch via SearXNG for query [${queryText}]: ${error.message}`
        );
    }
};

export const SearxngAgentService = {
    searchWeb,
};
