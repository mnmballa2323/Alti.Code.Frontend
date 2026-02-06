import catchAsync from "../../../shared/catchAsync.js";
import sendResponse from "../../../shared/sendResponse.js";
import httpStatus from "http-status";
import { AgentStoreService } from "./agentStore.service.js";

const createAgent = catchAsync(async (req, res) => {
    const result = await AgentStoreService.createAgentListing(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Agent listing created successfully",
        data: result,
    });
});

const getAllAgents = catchAsync(async (req, res) => {
    const filters = req.query;
    const result = await AgentStoreService.getAllAgents(filters);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Agents retrieved successfully",
        data: result,
    });
});

const getAgent = catchAsync(async (req, res) => {
    const result = await AgentStoreService.getAgentById(req.params.id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Agent retrieved successfully",
        data: result,
    });
});

const installAgent = catchAsync(async (req, res) => {
    // Assuming user is attached to req by auth middleware, for now mock or use body
    const userId = req.user?.id || req.body.userId || "mock-user-id";
    const { agentId } = req.params;

    const result = await AgentStoreService.installAgent(userId, agentId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Agent installed successfully",
        data: result,
    });
});

export const AgentStoreController = {
    createAgent,
    getAllAgents,
    getAgent,
    installAgent,
};
