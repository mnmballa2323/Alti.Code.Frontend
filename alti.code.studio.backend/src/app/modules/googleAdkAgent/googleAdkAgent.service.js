import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const GOOGLE_ADK_URL = config.google_adk_url || 'http://localhost:3011';

const executeGoAgent = async (taskPayload) => {
    try {
        const response = await axios.post(`${GOOGLE_ADK_URL}/api/v1/execute`, {
            task: taskPayload,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to execute Google ADK Go Agent: ${error.message}`
        );
    }
};

export const GoogleAdkAgentService = {
    executeGoAgent,
};
