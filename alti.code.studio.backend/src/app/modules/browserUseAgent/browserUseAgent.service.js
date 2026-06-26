import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const BROWSER_USE_API_URL = config.browser_use_url || 'http://localhost:3018';

const runBrowserTask = async (taskDescription, options = {}) => {
  try {
    const response = await axios.post(
      `${BROWSER_USE_API_URL}/api/v1/browser/run`,
      {
        task: taskDescription,
        headless: options.headless !== undefined ? options.headless : true,
        chrome_path: options.chromePath || options.chrome_path || null,
        user_data_dir: options.userDataDir || options.user_data_dir || null,
        proxy: options.proxy || null,
      },
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to run Browser-Use automation task: ${error.message}`,
    );
  }
};

const getBrowserTaskStatus = async taskId => {
  try {
    const response = await axios.get(
      `${BROWSER_USE_API_URL}/api/v1/browser/status/${taskId}`,
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to get Browser-Use task status: ${error.message}`,
    );
  }
};

const cancelBrowserTask = async taskId => {
  try {
    const response = await axios.delete(
      `${BROWSER_USE_API_URL}/api/v1/browser/cancel/${taskId}`,
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to cancel Browser-Use automation task: ${error.message}`,
    );
  }
};

const getBrowserSessions = async () => {
  try {
    const response = await axios.get(
      `${BROWSER_USE_API_URL}/api/v1/browser/sessions`,
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to get Browser-Use sessions: ${error.message}`,
    );
  }
};

const getScreenshot = async (taskId, step) => {
  try {
    const response = await axios.get(
      `${BROWSER_USE_API_URL}/api/v1/browser/screenshot/${taskId}/${step}`,
      {
        responseType: 'arraybuffer',
      },
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to get Browser-Use screenshot: ${error.message}`,
    );
  }
};

const getPageSource = async taskId => {
  try {
    const response = await axios.get(
      `${BROWSER_USE_API_URL}/api/v1/browser/source/${taskId}`,
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to get Browser-Use page source: ${error.message}`,
    );
  }
};

export const BrowserUseAgentService = {
  runBrowserTask,
  getBrowserTaskStatus,
  cancelBrowserTask,
  getBrowserSessions,
  getScreenshot,
  getPageSource,
};
