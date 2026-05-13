import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { SimulatorService } from '../shadowWorkspace/sandbox.service.js';

const runCode = catchAsync(async (req, res) => {
    const { code, context } = req.body;
    const result = await SimulatorService.execute(code, context);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Sandbox Execution Complete',
        data: result,
    });
});

const injectChaos = catchAsync(async (req, res) => {
    const { target, type } = req.body;
    const result = await SimulatorService.injectChaos(target, type);
    sendResponse(res, {
        statusCode: httpStatus.ACCEPTED,
        success: true,
        message: 'Chaos Injected',
        data: result,
    });
});

const loadTest = catchAsync(async (req, res) => {
    const { endpoint, rps } = req.body;
    const result = await SimulatorService.loadTest(endpoint, rps);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Load Test Complete',
        data: result,
    });
});

export const simulatorController = {
    runCode,
    injectChaos,
    loadTest
};
