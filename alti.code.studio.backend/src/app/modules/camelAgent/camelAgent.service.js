import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const CAMEL_API_URL = config.camel_url || 'http://localhost:3008';

const simulateSociety = async (scenario, numberOfAgents) => {
  try {
    const response = await axios.post(`${CAMEL_API_URL}/api/v1/simulate`, {
      scenario,
      agentCount: numberOfAgents,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to simulate society via CAMEL: ${error.message}`,
    );
  }
};

const runStressTest = async systemArchitecture => {
  try {
    const response = await axios.post(`${CAMEL_API_URL}/api/v1/stresstest`, {
      architecture: systemArchitecture,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to run CAMEL stress test: ${error.message}`,
    );
  }
};

export const CamelAgentService = {
  simulateSociety,
  runStressTest,
};
