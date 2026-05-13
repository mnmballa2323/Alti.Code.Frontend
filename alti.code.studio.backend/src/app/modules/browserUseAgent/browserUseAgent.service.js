import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const BROWSER_USE_API_URL = config.browser_use_url || 'http://localhost:3018';

const runBrowserTask = async (taskDescription) => {
    try {
        const response = await axios.post(`${BROWSER_USE_API_URL}/api/v1/browser/run`, {
            task: taskDescription,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to run Browser-Use automation task: ${error.message}`
        );
    }
};

const getBrowserTaskStatus = async (taskId) => {
    try {
        const response = await axios.get(`${BROWSER_USE_API_URL}/api/v1/browser/status/${taskId}`);
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to get Browser-Use task status: ${error.message}`
        );
    }
};

export const BrowserUseAgentService = {
    runBrowserTask,
    getBrowserTaskStatus,
};
