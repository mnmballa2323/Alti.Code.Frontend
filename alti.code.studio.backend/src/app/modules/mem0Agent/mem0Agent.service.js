import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const MEM0_API_URL = config.mem0_url || 'http://localhost:3017';

const addMemory = async (userId, sessionContext, memoryPayload) => {
    try {
        const response = await axios.post(`${MEM0_API_URL}/api/v1/memory/add`, {
            user_id: userId,
            session: sessionContext,
            data: memoryPayload,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to add memory to Mem0 hybrid database: ${error.message}`
        );
    }
};

const searchMemory = async (userId, query) => {
    try {
        const response = await axios.post(`${MEM0_API_URL}/api/v1/memory/search`, {
            user_id: userId,
            query: query,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to search Mem0 database: ${error.message}`
        );
    }
};

export const Mem0AgentService = {
    addMemory,
    searchMemory,
};
