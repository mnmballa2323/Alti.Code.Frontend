import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const UNSTRUCTURED_API_URL = config.unstructured_url || 'http://localhost:3022';

const extractDocument = async (fileBuffer, filename) => {
  try {
    const formData = new FormData();
    formData.append('files', new Blob([fileBuffer]), filename);

    // Unstructured.io open-source API standard endpoint
    const response = await axios.post(
      `${UNSTRUCTURED_API_URL}/general/v0/general`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to extract data using Unstructured.io pipeline: ${error.message}`,
    );
  }
};

export const UnstructuredAgentService = {
  extractDocument,
};
