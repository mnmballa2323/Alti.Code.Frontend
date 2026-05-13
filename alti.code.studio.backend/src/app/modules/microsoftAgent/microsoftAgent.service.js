import axios from 'axios';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import config from '../../../../config/index.js';

const MS_AGENT_API_URL = config.ms_agent_url || 'http://localhost:3010';

const runGraphWorkflow = async (workflowDefinition, context) => {
    try {
        const response = await axios.post(`${MS_AGENT_API_URL}/api/v1/workflow`, {
            workflow: workflowDefinition,
            context,
        });
        return response.data;
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            `Failed to execute Microsoft Agent Workflow: ${error.message}`
        );
    }
};

export const MicrosoftAgentService = {
    runGraphWorkflow,
};
