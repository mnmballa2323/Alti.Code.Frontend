import express from 'express';
import { ENUM_USER_ROLE } from '../../../shared/enum.js';
import auth from '../../middlewares/auth/auth.js';
import { FazmAgentController } from './fazmAgent.controller.js';
import audioUploader from '../../middlewares/uploder/uploadAudio.js';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Ensure attachments directory exists
fs.mkdirSync('uploads/attachments/', { recursive: true });

const attachmentStorage = multer.diskStorage({
    destination: 'uploads/attachments/',
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
});

const attachmentUploader = multer({
    storage: attachmentStorage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

const router = express.Router();

// ─── Public Endpoints ───
router.get(
    '/v1/vertex/jwks',
    FazmAgentController.jwks
);

router.get(
    '/.well-known/openid-configuration',
    FazmAgentController.oidcConfig
);

router.post(
    '/api/auth/magic-link/request',
    FazmAgentController.requestMagicLink
);

router.post(
    '/api/auth/magic-link/verify',
    FazmAgentController.verifyMagicLink
);

// ─── Authenticated Endpoints ───
router.post(
    '/run',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.runAutomation
);

router.get(
    '/status/:taskId',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.getStatus
);

router.post(
    '/v1/keys',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.getKeys
);

router.post(
    '/api/relay/register',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.registerTunnel
);

router.post(
    '/api/relay/unregister',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.unregisterTunnel
);

router.get(
    '/api/relay/discover',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.discoverTunnel
);

router.post(
    '/api/relay/heartbeat',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.heartbeat
);

router.post(
    '/v1/vertex/subject-token',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.subjectToken
);

// Recording and chat attachment stubs
router.post(
    '/api/session-recording/get-upload-url',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.getUploadUrl
);

router.post(
    '/api/session-recording/upload',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    audioUploader.single('file'),
    FazmAgentController.uploadRecording
);

router.post(
    '/api/session-recording/auto-enroll',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.autoEnroll
);

router.post(
    '/api/founder-chat/get-attachment-upload-url',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.getAttachmentUploadUrl
);

router.post(
    '/mock-upload',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    attachmentUploader.single('file'),
    FazmAgentController.uploadAttachment
);

// Composio stubs
router.post(
    '/api/composio/connect',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.composioConnect
);

router.get(
    '/api/composio/status',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.composioStatus
);

router.post(
    '/api/composio/disconnect',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.composioDisconnect
);

router.post(
    '/api/composio/mcp/:toolkit',
    auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER),
    FazmAgentController.composioMcp
);

export const FazmAgentRoutes = router;
