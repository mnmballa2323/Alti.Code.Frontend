/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse.js';
import { catchAsync } from '../../../shared/catchAsync.js';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

const { livekit_secret_key, livekit_api_key } = config;

/** Generate a random uppercase participant identifier. */
const generateParticipantName = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // Use crypto.randomInt for uniform distribution — Math.random() is not secure
  return Array.from(
    { length },
    () => chars[crypto.randomInt(chars.length)],
  ).join('');
};

/**
 * POST /api/v1/streaming/auth
 * Issues a LiveKit JWT for the requesting user to join a shared room.
 */
export const authStreamingController = catchAsync(async (req, res) => {
  if (!livekit_api_key || !livekit_secret_key) {
    logger.error('StreamingController: LiveKit keys missing from config.');
    return sendResponse(res, {
      statusCode: httpStatus.SERVICE_UNAVAILABLE,
      success: false,
      message: 'Streaming service is not configured.',
      data: null,
    });
  }

  // Dynamic import — livekit-server-sdk is an optional dep
  const { AccessToken } = await import('livekit-server-sdk');

  const roomName = req.body?.room || 'alti-studio-room';
  const participantName = req.user?.username ?? generateParticipantName();

  logger.info(
    `📡 StreamingController: Issuing token for [${participantName}] → room [${roomName}]`,
  );

  const at = new AccessToken(livekit_api_key, livekit_secret_key, {
    identity: participantName,
    ttl: '60m',
  });
  at.addGrant({ roomJoin: true, room: roomName });

  const token = await at.toJwt();

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Streaming token generated',
    data: { token, room: roomName, participant: participantName },
  });
});
