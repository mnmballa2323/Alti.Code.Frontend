/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { AiWebsiteClonerService } from './aiWebsiteCloner.service.js';

const cloneWebsite = catchAsync(async (req, res) => {
  const { targetUrl, projectName, workspace } = req.body;

  if (!targetUrl) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: 'targetUrl is required.' });
  }
  if (!projectName) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, message: 'projectName is required.' });
  }

  const result = await AiWebsiteClonerService.prepareClonerTemplate(
    targetUrl,
    projectName,
    workspace,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'AI Website Cloner project created successfully.',
    data: result,
  });
});

export const AiWebsiteClonerController = {
  cloneWebsite,
};
