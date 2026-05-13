import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { architectService } from './architect.service.js';

const generateTerraform = catchAsync(async (req, res) => {
    const { provider, resources } = req.body;
    const result = await architectService.generateTerraform(provider, resources);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Terraform generated successfully',
        data: result,
    });
});

const dockerize = catchAsync(async (req, res) => {
    const { stack } = req.body;
    const result = await architectService.dockerize(stack);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Dockerfile created successfully',
        data: result,
    });
});

const generateK8s = catchAsync(async (req, res) => {
    const { serviceName } = req.body;
    const result = await architectService.generateK8s(serviceName);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'K8s manifests generated successfully',
        data: result,
    });
});

export const architectController = {
    generateTerraform,
    dockerize,
    generateK8s
};
