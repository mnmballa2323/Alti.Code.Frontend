import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { smartRoutingEngine } from './smartRouter.service.js';

const determineRoute = catchAsync(async (req, res) => {
    const { task, context } = req.body;
    
    if (!task) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'task string is required.' });
    }

    const assignedAgentId = await smartRoutingEngine.routeTask(task, context);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Task successfully mapped by Universal Smart Routing Engine.',
        data: { agentId: assignedAgentId },
    });
});

const registerDynamicAgent = catchAsync(async (req, res) => {
    const { agentId, capabilities } = req.body;
    
    if (!agentId || !capabilities) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'agentId and capabilities are required.' });
    }

    smartRoutingEngine.registerAgent(agentId, capabilities);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Agent ${agentId} successfully connected to the Smart Routing Engine mesh.`,
        data: null,
    });
});

export const SmartRouterController = {
    determineRoute,
    registerDynamicAgent
};
