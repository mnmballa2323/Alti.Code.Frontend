import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const GCP_GDC_LOCAL_URL = config.gcp_gdc_local_url || 'http://localhost:11434';

const generateCompletion = async (modelName, promptText, stream = false) => {
  try {
    const response = await axios.post(`${GCP_GDC_LOCAL_URL}/api/generate`, {
      model: modelName,
      prompt: promptText,
      stream: stream,
    });
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to generate completion from local GDC model [${modelName}]: ${error.message}`,
    );
  }
};

const getLocalModels = async () => {
  try {
    const response = await axios.get(`${GCP_GDC_LOCAL_URL}/api/tags`);
    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch local GDC models: ${error.message}`,
    );
  }
};

export const GdcAgentService = {
  generateCompletion,
  getLocalModels,
};
