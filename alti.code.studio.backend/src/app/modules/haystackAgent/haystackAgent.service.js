import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const HAYSTACK_API_URL = config.haystack_url || 'http://localhost:3009';

const buildReasoningGraph = async codebasePath => {
  try {
    const response = await axios.post(`${HAYSTACK_API_URL}/api/v1/index`, {
      path: codebasePath,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to build reasoning graph via Haystack: ${error.message}`,
    );
  }
};

const queryGraph = async question => {
  try {
    const response = await axios.post(`${HAYSTACK_API_URL}/api/v1/query`, {
      question,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to query codebase reasoning graph: ${error.message}`,
    );
  }
};

export const HaystackAgentService = {
  buildReasoningGraph,
  queryGraph,
};
