import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { LangGraphAgentService } from './langGraphAgent.service.js';

const executeGraph = catchAsync(async (req, res) => {
  const { graphDefinition, initialState } = req.body;

  if (!graphDefinition || !initialState) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'graphDefinition and initialState are required.',
    });
  }

  const result = await LangGraphAgentService.runStatefulGraph(
    graphDefinition,
    initialState,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'LangGraph stateful workflow executed.',
    data: result,
  });
});

export const LangGraphAgentController = {
  executeGraph,
};
