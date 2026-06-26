import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const LANGGRAPH_API_URL = config.langgraph_url || 'http://localhost:3016';

const runStatefulGraph = async (graphDefinition, initialState) => {
  try {
    const response = await axios.post(`${LANGGRAPH_API_URL}/api/v1/graph/run`, {
      graph: graphDefinition,
      state: initialState,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to execute LangGraph stateful flow: ${error.message}`,
    );
  }
};

export const LangGraphAgentService = {
  runStatefulGraph,
};
