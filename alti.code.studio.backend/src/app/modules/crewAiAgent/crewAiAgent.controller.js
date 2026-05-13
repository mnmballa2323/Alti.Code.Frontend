import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { CrewAiAgentService } from './crewAiAgent.service.js';

const startDebate = catchAsync(async (req, res) => {
    const { topic, agents } = req.body;
    
    if (!topic || !agents || !Array.isArray(agents)) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'topic and an array of agents are required.' });
    }

    const result = await CrewAiAgentService.runDebate(topic, agents);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'CrewAI debate started.',
        data: result,
    });
});

const generateSpec = catchAsync(async (req, res) => {
    const { requirements } = req.body;
    
    if (!requirements) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'requirements is required.' });
    }

    const result = await CrewAiAgentService.compileSpec(requirements);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'CrewAI spec compiled.',
        data: result,
    });
});

export const CrewAiAgentController = {
    startDebate,
    generateSpec,
};
