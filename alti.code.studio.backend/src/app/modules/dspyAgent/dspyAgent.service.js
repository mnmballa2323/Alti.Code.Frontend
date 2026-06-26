import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const DSPY_API_URL = config.dspy_url || 'http://localhost:3021';

const optimizePrompt = async (taskDescription, trainingExamples) => {
  try {
    const response = await axios.post(`${DSPY_API_URL}/api/v1/optimize`, {
      task: taskDescription,
      examples: trainingExamples,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to compile prompt with Stanford DSPy: ${error.message}`,
    );
  }
};

export const DspyAgentService = {
  optimizePrompt,
};
