/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { SecurityAgentService } from './securityAgent.service.js';
import { logger } from '../../../shared/logger.js';

/** Accepted truthy values for the device-posture header. */
const TRUSTED_POSTURE_VALUES = new Set(['true', '1', 'yes']);

/** Reject any repoPath that contains path-traversal sequences. */
const isPathTraversal = p => !p || /(\.\.[/\\]|[/\\]\.\.)/.test(p);

const startAudit = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const sessionId = req.body.sessionId || `security-${Date.now()}`;

  // 1. BeyondCorp Zero-Trust — header ONLY (body params are client-forgeable)
  const devicePostureHeader = req.headers['x-device-posture-valid'];
  const isValidPosture = TRUSTED_POSTURE_VALUES.has(
    String(devicePostureHeader ?? '').toLowerCase(),
  );

  if (!isValidPosture) {
    const warning = `🚨 [MANDIANT SEV-1] Zero-Trust Violation: Unauthorized access to Code Security Scanner. Device Posture Invalid. User: ${userId}`;
    logger.error(warning);
    return sendResponse(res, {
      statusCode: httpStatus.FORBIDDEN,
      success: false,
      message:
        'Access Denied: BeyondCorp Zero-Trust Identity-Aware Proxy validation failed.',
      data: { error: 'Missing or invalid x-device-posture-valid header.' },
    });
  }

  // 2. Validate repoPath — must be present and must not contain traversal sequences
  const { repoPath } = req.body;
  if (isPathTraversal(repoPath)) {
    logger.warn(
      `[SecurityAgent] Rejected audit request with invalid repoPath: "${repoPath}" from User: ${userId}`,
    );
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message:
        'Invalid repoPath: path must be provided and must not contain path-traversal sequences.',
      data: null,
    });
  }

  const result = await SecurityAgentService.auditCodebase(
    repoPath,
    userId,
    sessionId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Security audit completed successfully',
    data: result,
  });
});

export const SecurityAgentController = {
  startAudit,
};
