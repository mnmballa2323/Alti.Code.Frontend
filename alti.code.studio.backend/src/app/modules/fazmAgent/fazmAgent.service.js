import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

// The ACP bridge daemon default port is 7800
const FAZM_API_URL = config.fazm_url || 'http://localhost:7800';

const runTask = async (taskDescription) => {
    try {
        const response = await axios.post(`${FAZM_API_URL}/api/v1/run`, {
            task: taskDescription,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to run Fazm desktop automation task: ${error.message}`
        );
    }
};

const getStatus = async (taskId) => {
    try {
        const response = await axios.get(`${FAZM_API_URL}/api/v1/status/${taskId}`);
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to get Fazm task status: ${error.message}`
        );
    }
};

export const FazmAgentService = {
    runTask,
    getStatus,
};
