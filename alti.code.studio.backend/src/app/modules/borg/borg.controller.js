import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { director } from './Director.js';

const startTask = catchAsync(async (req, res) => {
  const { goal } = req.body;
  const userId = req.user?._id || 'system'; // Auth middleware should populate this

  const missionId = await director.startMission(goal, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Mission started successfully',
    data: { missionId },
  });
});

const getTaskStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const status = director.getMissionStatus(id);

  if (!status) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Mission not found',
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Mission status retrieved',
    data: status,
  });
});

export const BorgController = {
  startTask,
  getTaskStatus,
};
