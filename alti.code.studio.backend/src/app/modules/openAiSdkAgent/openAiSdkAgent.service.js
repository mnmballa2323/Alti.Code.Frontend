import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const OPENAI_SDK_URL = config.openai_sdk_url || 'http://localhost:3013';

const orchestrateHandoff = async (currentAgent, nextAgent, sessionData) => {
    try {
        const response = await axios.post(`${OPENAI_SDK_URL}/api/v1/handoff`, {
            from: currentAgent,
            to: nextAgent,
            data: sessionData
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to orchestrate OpenAI Agents SDK handoff: ${error.message}`
        );
    }
};

export const OpenAiSdkAgentService = {
    orchestrateHandoff,
};
