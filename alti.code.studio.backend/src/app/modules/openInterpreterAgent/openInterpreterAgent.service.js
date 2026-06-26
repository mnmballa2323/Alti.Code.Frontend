import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const OPEN_INTERPRETER_API_URL =
  config.open_interpreter_url || 'http://localhost:3024';

const executeCode = async (language, codeSnippet) => {
  try {
    // We send code directly to the Open Interpreter container for isolated execution
    const response = await axios.post(
      `${OPEN_INTERPRETER_API_URL}/api/v1/execute`,
      {
        language: language, // 'python', 'javascript', 'shell'
        code: codeSnippet,
      },
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to execute code securely via Open Interpreter container: ${error.message}`,
    );
  }
};

export const OpenInterpreterAgentService = {
  executeCode,
};
