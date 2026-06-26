import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const OPENHANDS_API_URL = config.openhands_url || 'http://localhost:3005';

const runTask = async (taskDescription, workspacePath) => {
  try {
    const response = await axios.post(`${OPENHANDS_API_URL}/api/v1/sessions`, {
      task: taskDescription,
      workspace: workspacePath || '/workspace',
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to execute task in OpenHands sandbox: ${error.message}`,
    );
  }
};

const getTaskStatus = async sessionId => {
  try {
    const response = await axios.get(
      `${OPENHANDS_API_URL}/api/v1/sessions/${sessionId}`,
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to get task status from OpenHands sandbox: ${error.message}`,
    );
  }
};

export const OpenHandsAgentService = {
  runTask,
  getTaskStatus,
};
