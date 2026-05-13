import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const LANGFUSE_API_URL = config.langfuse_url || 'http://localhost:3000';

const traceExecution = async (traceId, traceData) => {
    try {
        const response = await axios.post(`${LANGFUSE_API_URL}/api/public/traces`, {
            id: traceId,
            name: traceData.name,
            metadata: traceData.metadata,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to trace execution via Langfuse: ${error.message}`
        );
    }
};

const evaluateAgent = async (traceId, metricsData) => {
    try {
        const response = await axios.post(`${LANGFUSE_API_URL}/api/public/evaluations`, {
            trace_id: traceId,
            metrics: metricsData,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to evaluate agent via Langfuse: ${error.message}`
        );
    }
};

export const LangfuseAgentService = {
    traceExecution,
    evaluateAgent,
};
