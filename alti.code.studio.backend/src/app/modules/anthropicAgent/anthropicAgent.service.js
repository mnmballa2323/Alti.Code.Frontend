import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const ANTHROPIC_PTC_URL = config.anthropic_ptc_url || 'http://localhost:3014';

const programmaticToolCall = async (terminalCommand, contextEnvs) => {
    try {
        const response = await axios.post(`${ANTHROPIC_PTC_URL}/api/v1/toolcall`, {
            command: terminalCommand,
            env: contextEnvs
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to execute Anthropic Programmatic Tool Call: ${error.message}`
        );
    }
};

export const AnthropicAgentService = {
    programmaticToolCall,
};
