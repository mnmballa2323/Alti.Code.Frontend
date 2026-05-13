import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const SWEKIT_API_URL = config.swekit_url || 'http://localhost:3006';

const getAst = async (filePath) => {
    try {
        const response = await axios.get(`${SWEKIT_API_URL}/api/v1/ast`, {
            params: { path: filePath }
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to fetch AST from SWE-Kit: ${error.message}`
        );
    }
};

const validateCode = async (filePath, codeContent) => {
    try {
        const response = await axios.post(`${SWEKIT_API_URL}/api/v1/validate`, {
            path: filePath,
            content: codeContent
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to validate code using SWE-Kit: ${error.message}`
        );
    }
};

export const SweKitAgentService = {
    getAst,
    validateCode,
};
