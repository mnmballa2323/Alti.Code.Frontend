import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { tpuOrchestratorService } from './tpu_orchestrator.service.js';

const provisionTpu = catchAsync(async (req, res) => {
    const { nodeId } = req.body;
    
    if (!nodeId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'nodeId is required to provision a TPU.' });
    }

    const operationName = await tpuOrchestratorService.provisionDedicatedTpu(nodeId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Google Cloud TPU v5e Pod provisioning initiated.`,
        data: { operationName },
    });
});

export const TpuController = {
    provisionTpu
};
