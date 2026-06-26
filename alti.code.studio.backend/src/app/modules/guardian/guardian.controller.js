/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { GuardianService } from './guardian.service.js';

const audit = catchAsync(async (req, res) => {
  const { code, context } = req.body;
  const result = await GuardianService.auditCode(code, context);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Guardian Audit Complete',
    data: result,
  });
});

export const GuardianController = {
  audit,
};
