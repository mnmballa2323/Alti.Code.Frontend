import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { workflowService } from './workflow.service.js';

const executeSwarm = catchAsync(async (req, res) => {
    const { swarmState } = req.body;
    
    if (!swarmState) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'swarmState object is required.' });
    }

    const executionName = await workflowService.executeSwarm(swarmState);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Google Cloud Workflows state machine execution launched.',
        data: { executionName },
    });
});

const createWorkflow = catchAsync(async (req, res) => {
    const { name } = req.body;
    const userId = req.user?.id; // Assumes auth middleware populates req.user

    if (!name) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Workflow name is required.' });
    }

    if (!userId) {
        // Fallback for mock environments if req.user is missing
        return res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: 'User must be authenticated.' });
    }

    const workflow = await workflowService.createWorkflow(userId, name);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Google Cloud Vertex AI successfully architected the workflow.',
        data: workflow,
    });
});

export const WorkflowController = {
    executeSwarm,
    createWorkflow
};
