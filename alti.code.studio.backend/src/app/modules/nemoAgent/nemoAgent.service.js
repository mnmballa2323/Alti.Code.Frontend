import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const NEMO_API_URL = config.nemo_agent_url || 'http://localhost:3012';

const optimizeRouting = async (agentInteractions) => {
    try {
        const response = await axios.post(`${NEMO_API_URL}/api/v1/route`, {
            interactions: agentInteractions,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to optimize via NVIDIA NeMo: ${error.message}`
        );
    }
};

export const NemoAgentService = {
    optimizeRouting,
};
