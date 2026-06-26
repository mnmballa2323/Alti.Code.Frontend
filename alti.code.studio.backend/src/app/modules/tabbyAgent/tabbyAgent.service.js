import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const TABBY_API_URL = config.tabby_url || 'http://localhost:8080';

const getCodeCompletion = async promptText => {
  try {
    const response = await axios.post(`${TABBY_API_URL}/v1/completions`, {
      prompt: promptText,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to get code completion from Tabby: ${error.message}`,
    );
  }
};

const chatWithTabby = async messages => {
  try {
    const response = await axios.post(`${TABBY_API_URL}/v1/chat/completions`, {
      messages: messages,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to chat with Tabby: ${error.message}`,
    );
  }
};

export const TabbyAgentService = {
  getCodeCompletion,
  chatWithTabby,
};
