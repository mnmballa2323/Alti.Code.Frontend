import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const AZURE_ADK_URL = config.azure_adk_url || 'http://localhost:3011';

const executeGoAgent = async (taskPayload) => {
    try {
        const response = await axios.post(`${AZURE_ADK_URL}/api/v1/execute`, {
            task: taskPayload,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to execute Azure ADK Go Agent: ${error.message}`
        );
    }
};

export const AzureAdkAgentService = {
    executeGoAgent,
};
