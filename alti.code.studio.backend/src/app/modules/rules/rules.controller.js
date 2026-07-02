import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { RulesService } from './rules.service.js';

const getRules = catchAsync(async (req, res) => {
  const result = await RulesService.parseRules();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Codebase rules retrieved successfully.',
    data: result,
  });
});

const updateRules = catchAsync(async (req, res) => {
  const { instructions, guardrails, repositories, apis, sdks, mcps } = req.body;

  const result = await RulesService.saveRules(
    instructions,
    guardrails,
    repositories,
    apis,
    sdks,
    mcps,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Codebase rules updated successfully.',
    data: result,
  });
});

export const RulesController = {
  getRules,
  updateRules,
};
