import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const LITELLM_URL = config.litellm_url || 'http://localhost:4000';

const routeCompletion = async (model, messages, parameters = {}) => {
    try {
        // LiteLLM exposes a standard OpenAI-compatible completions endpoint
        const response = await axios.post(`${LITELLM_URL}/v1/chat/completions`, {
            model: model, // e.g., 'gpt-4o', 'claude-3-opus', 'gemini-1.5-pro'
            messages: messages,
            ...parameters,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to route LLM request through LiteLLM Gateway: ${error.message}`
        );
    }
};

const getProxySpendLogs = async () => {
    try {
        const response = await axios.get(`${LITELLM_URL}/v1/spend/logs`);
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch spend logs from LiteLLM: ${error.message}`
        );
    }
};

export const LitellmGatewayService = {
    routeCompletion,
    getProxySpendLogs,
};
