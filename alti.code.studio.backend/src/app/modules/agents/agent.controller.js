/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { graphOrchestrator } from './graph.orchestrator.js';
import { logger } from '../../../shared/logger.js';
<<<<<<< HEAD
=======
import { puppeteerAgent } from './puppeteer.agent.js';
import { cloudBatchService } from '../googleCloud/batch.service.js';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)

const startMission = catchAsync(async (req, res) => {
    const { goal } = req.body;
    const sessionId = `mission-${Date.now()}`;
    const userId = req.user?.id || 'anonymous';

    if (!goal) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Goal is required");
    }

    logger.info(`🚀 API: Starting mission for user ${userId}: ${goal}`);

    // Run in background (don't await full completion if long-running)
    // For now, we await to return results simply
    const results = await graphOrchestrator.run(goal);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Mission executed successfully',
        data: results,
    });
});

const getAgentStatus = catchAsync(async (req, res) => {
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Agent System Operational',
        data: {
            orchestrator: 'active',
            tools: ['surfer', 'vector', 'siren']
        }
    });
});

export const AgentController = {
    startMission,
    toggleChaos: (req, res) => {
        logger.info("🕹️ API: toggleChaos Request received", { body: req.body });

        try {
            const { enabled } = req.body;

            if (typeof enabled !== 'boolean') {
                logger.warn("⚠️ Invalid input for toggleChaos");
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid input: 'enabled' must be a boolean"
                });
            }

            global.CHAOS_MODE = enabled;
            logger.info(`🔥 Global Chaos Mode set to: ${global.CHAOS_MODE}`);

            res.status(httpStatus.OK).json({
                success: true,
                message: `Chaos Mode set to ${global.CHAOS_MODE}`
            });
        } catch (error) {
            logger.error("❌ Error in toggleChaos:", error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    },
<<<<<<< HEAD
    getAgentStatus
=======
    getAgentStatus,
    exploreUrl: catchAsync(async (req, res) => {
        const { url } = req.body;
        if (!url) return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'URL required' });
        
        const content = await puppeteerAgent.scrapeRenderedContext(url);
        
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Web exploration completed successfully',
            data: { content },
        });
    }),
    allocateComputeCluster: catchAsync(async (req, res) => {
        const { jobId, dockerImage, commands } = req.body;
        
        if (!jobId || !dockerImage || !commands) {
            return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'jobId, dockerImage, and commands required' });
        }
        
        const result = await cloudBatchService.submitComputeJob(jobId, dockerImage, commands);
        
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Compute cluster allocation initiated',
            data: result,
        });
    })
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
};
