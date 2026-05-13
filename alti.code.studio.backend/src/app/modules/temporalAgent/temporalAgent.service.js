import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const TEMPORAL_API_URL = config.temporal_url || 'http://localhost:3015';

const startWorkflow = async (workflowName, workflowArgs, workflowId) => {
    try {
        const response = await axios.post(`${TEMPORAL_API_URL}/api/v1/workflow/start`, {
            name: workflowName,
            args: workflowArgs,
            id: workflowId,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to start Temporal durable workflow: ${error.message}`
        );
    }
};

const getWorkflowResult = async (workflowId) => {
    try {
        const response = await axios.get(`${TEMPORAL_API_URL}/api/v1/workflow/${workflowId}`);
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to get Temporal workflow result: ${error.message}`
        );
    }
};

export const TemporalAgentService = {
    startWorkflow,
    getWorkflowResult,
};
