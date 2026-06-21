import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import { FazmAgentService } from './fazmAgent.service.js';
const getUserId = (req) => {
    return req.user?.id || req.user?.uid || req.user?.sub || req.user?.email || 'unknown';
};

const getKeys = catchAsync(async (req, res) => {
    const result = await FazmAgentService.getKeys();
    res.status(httpStatus.OK).json(result);
});

const registerTunnel = catchAsync(async (req, res) => {
    const { tunnel_url } = req.body;
    if (!tunnel_url) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'tunnel_url is required.' });
    }
    const userId = getUserId(req);
    const result = await FazmAgentService.registerTunnel(userId, tunnel_url);
    res.status(httpStatus.OK).json(result);
});

const unregisterTunnel = catchAsync(async (req, res) => {
    const userId = getUserId(req);
    const result = await FazmAgentService.unregisterTunnel(userId);
    res.status(httpStatus.OK).json(result);
});

const discoverTunnel = catchAsync(async (req, res) => {
    const userId = getUserId(req);
    const result = await FazmAgentService.discoverTunnel(userId);
    res.status(httpStatus.OK).json(result);
});

const subjectToken = catchAsync(async (req, res) => {
    const deviceId = req.headers['x-device-id'] || 'default-device';
    const token = await FazmAgentService.generateSubjectToken(deviceId);
    res.setHeader('Content-Type', 'text/plain');
    res.status(httpStatus.OK).send(token);
});

const jwks = catchAsync(async (req, res) => {
    const result = FazmAgentService.getJwks();
    res.status(httpStatus.OK).json(result);
});

const oidcConfig = catchAsync(async (req, res) => {
    const result = FazmAgentService.getOidcConfig();
    res.status(httpStatus.OK).json(result);
});

const requestMagicLink = catchAsync(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'email is required.' });
    }
    const result = await FazmAgentService.requestMagicLink(email);
    res.status(httpStatus.OK).json(result);
});

const verifyMagicLink = catchAsync(async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'email and code are required.' });
    }
    const result = await FazmAgentService.verifyMagicLink(email, code);
    res.status(httpStatus.OK).json(result);
});

// Session recording and other secondary stubs
const getUploadUrl = catchAsync(async (req, res) => {
    const host = req.get('host') || `localhost:${process.env.PORT || 5000}`;
    const protocol = req.protocol || 'http';
    res.status(httpStatus.OK).json({
        upload_url: `${protocol}://${host}/api/v1/oss-swarm/fazm/api/session-recording/upload`,
        file_path: 'recording.mp4'
    });
});

const uploadRecording = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'No file uploaded.' });
    }
    
    const filePath = req.file.path;
    const transcript = await FazmAgentService.transcribeAudio(filePath);
    
    res.status(httpStatus.OK).json({
        success: true,
        message: 'Audio uploaded and transcribed successfully.',
        file_path: filePath,
        transcript: transcript
    });
});

const autoEnroll = catchAsync(async (req, res) => {
    res.status(httpStatus.OK).json({ ok: true });
});

const getAttachmentUploadUrl = catchAsync(async (req, res) => {
    res.status(httpStatus.OK).json({
        upload_url: `http://localhost:${process.env.PORT || 5000}/api/v1/oss-swarm/fazm/mock-upload`,
        file_path: 'attachment.png'
    });
});



const uploadAttachment = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'No file uploaded.' });
    }
    res.status(httpStatus.OK).json({
        success: true,
        message: 'Attachment uploaded successfully.',
        file_path: req.file.path
    });
});

const runAutomation = catchAsync(async (req, res) => {
    const { task } = req.body;
    
    if (!task) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'task is required.' });
    }

    const userId = getUserId(req);
    const result = await FazmAgentService.runTask(userId, task);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Fazm automation task started.',
        data: result,
    });
});

const getStatus = catchAsync(async (req, res) => {
    const { taskId } = req.params;

    if (!taskId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'taskId is required.' });
    }

    const userId = getUserId(req);
    const status = await FazmAgentService.getStatus(userId, taskId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Fazm task status retrieved.',
        data: status,
    });
});

const heartbeat = catchAsync(async (req, res) => {
    const { tunnel_url } = req.body;
    if (!tunnel_url) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'tunnel_url is required.' });
    }
    const userId = getUserId(req);
    const result = await FazmAgentService.registerHeartbeat(userId, tunnel_url);
    res.status(httpStatus.OK).json(result);
});

export const FazmAgentController = {
    getKeys,
    registerTunnel,
    unregisterTunnel,
    discoverTunnel,
    subjectToken,
    jwks,
    oidcConfig,
    requestMagicLink,
    verifyMagicLink,
    getUploadUrl,
    autoEnroll,
    getAttachmentUploadUrl,
    runAutomation,
    getStatus,
    heartbeat,
    uploadRecording,
    uploadAttachment,
};
