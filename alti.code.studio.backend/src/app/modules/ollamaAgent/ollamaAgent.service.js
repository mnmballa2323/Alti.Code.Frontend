import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const OLLAMA_API_URL = config.ollama_url || 'http://localhost:11434';

const generateCompletion = async (modelName, promptText, stream = false) => {
    try {
        const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
            model: modelName,
            prompt: promptText,
            stream: stream,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to generate completion from local Ollama model [${modelName}]: ${error.message}`
        );
    }
};

const getLocalModels = async () => {
    try {
        const response = await axios.get(`${OLLAMA_API_URL}/api/tags`);
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch local Ollama models: ${error.message}`
        );
    }
};

export const OllamaAgentService = {
    generateCompletion,
    getLocalModels,
};
