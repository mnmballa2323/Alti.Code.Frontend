/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { randomUUID } from 'crypto';
import httpStatus from 'http-status';
import UserModel from '../app/modules/auth/auth.model.js';
import ApiError from '../errors/ApiError.js';

const validatePromptRequest = async (req, res) => {
  const prompt = req.body?.prompt;
  const userId = req.user?._id;
  const language = req.body?.language;
  const sessionId = req.body?.sessionId || randomUUID();
  const mode = req.body?.mode || 'Agent';
  const domain = req.body?.domain;

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
    const user = await UserModel.isUserExist(activeUserId);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return { prompt, userId: activeUserId, sessionId, language, mode, domain };
};
export default validatePromptRequest;
