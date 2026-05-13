import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { marketplaceService } from './marketplace.service.js';

const listAgents = catchAsync(async (req, res) => {
    const { search, category } = req.query;
    const agents = await marketplaceService.listAvailableAgents({ search, category });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Community catalog retrieved successfully',
        data: agents,
    });
});

const listInstalled = catchAsync(async (req, res) => {
    const agents = await marketplaceService.listInstalledAgents();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Installed agents retrieved successfully',
        data: agents,
    });
});

const getAgentDetails = catchAsync(async (req, res) => {
    const { agentId } = req.params;
    const agent = await marketplaceService.getAgentDetails(agentId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Agent details retrieved successfully',
        data: agent,
    });
});

const installAgent = catchAsync(async (req, res) => {
    const { agentId, version } = req.body;

    if (!agentId) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'agentId is required for installation',
        });
    }

    const result = await marketplaceService.installAgent(agentId, version);
    sendResponse(res, {
        statusCode: result.success ? httpStatus.OK : httpStatus.CONFLICT,
        success: result.success,
        message: result.message,
        data: result,
    });
});

const uninstallAgent = catchAsync(async (req, res) => {
    const { agentId } = req.params;
    const result = await marketplaceService.uninstallAgent(agentId);
    sendResponse(res, {
        statusCode: result.success ? httpStatus.OK : httpStatus.NOT_FOUND,
        success: result.success,
        message: result.message,
        data: result,
    });
});

export const marketplaceController = {
    listAgents,
    listInstalled,
    getAgentDetails,
    installAgent,
    uninstallAgent,
};
