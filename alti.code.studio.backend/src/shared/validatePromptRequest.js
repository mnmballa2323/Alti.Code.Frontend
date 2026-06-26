/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { randomUUID } from 'crypto';
import httpStatus from 'http-status';
import { UserRepository } from '../app/modules/auth/prisma.user.repository.js';
import ApiError from '../errors/ApiError.js';

const validatePromptRequest = async (req, res) => {
  const prompt = req.body?.prompt;
  const userId = req.user?._id || req.user?.id;
  const language = req.body?.language;
  const sessionId = req.body?.sessionId || randomUUID();
  const mode = req.body?.mode || 'Agent';
  const domain = req.body?.domain;
  const model = req.body?.model || 'claude-sonnet-4-5-20250929';

  if (!prompt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Prompt is required.');
  }

  let activeUserId = userId;
  const isProd = process.env.NODE_ENV === 'production';

  if (!activeUserId) {
    if (isProd) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
    } else {
      activeUserId = 'system_dev_user';
    }
  }

  if (activeUserId !== 'system_dev_user') {
    const user = await UserRepository.findById(activeUserId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return {
    prompt,
    userId: activeUserId,
    sessionId,
    language,
    mode,
    domain,
    model,
  };
};
export default validatePromptRequest;
