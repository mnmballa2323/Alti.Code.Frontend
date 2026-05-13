import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { serviceMesh } from './service_mesh.service.js';

const registerWorker = catchAsync(async (req, res) => {
    const { serviceName, endpointId, ipAddress, port } = req.body;
    
    if (!serviceName || !endpointId || !ipAddress || !port) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'serviceName, endpointId, ipAddress, and port are required.' });
    }

    await serviceMesh.registerWorkerNode(serviceName, endpointId, ipAddress, port);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Worker registered to Anthos Service Mesh via Google Service Directory.',
    });
});

export const ServiceMeshController = {
    registerWorker
};
