import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const CREWAI_API_URL = config.crewai_url || 'http://localhost:3007';

const runDebate = async (topic, agents) => {
    try {
        const response = await axios.post(`${CREWAI_API_URL}/api/v1/debate`, {
            topic,
            agents, // array of agent roles like ['Senior Architect', 'QA Engineer']
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to trigger CrewAI debate: ${error.message}`
        );
    }
};

const compileSpec = async (requirements) => {
    try {
        const response = await axios.post(`${CREWAI_API_URL}/api/v1/spec`, {
            requirements,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to compile spec from CrewAI: ${error.message}`
        );
    }
};

export const CrewAiAgentService = {
    runDebate,
    compileSpec,
};
