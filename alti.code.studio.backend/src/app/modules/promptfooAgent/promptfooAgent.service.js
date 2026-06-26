import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const PROMPTFOO_API_URL = config.promptfoo_url || 'http://localhost:3023';

const runEvaluation = async testSuiteConfig => {
  try {
    const response = await axios.post(
      `${PROMPTFOO_API_URL}/api/v1/eval`,
      testSuiteConfig,
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to run Promptfoo evaluation suite: ${error.message}`,
    );
  }
};

const runRedTeamScan = async targetPlugin => {
  try {
    const response = await axios.post(
      `${PROMPTFOO_API_URL}/api/v1/redteam/scan`,
      {
        target: targetPlugin,
      },
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to run Promptfoo red-team adversarial scan: ${error.message}`,
    );
  }
};

export const PromptfooAgentService = {
  runEvaluation,
  runRedTeamScan,
};
