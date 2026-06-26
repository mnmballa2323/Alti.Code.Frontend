import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { RecruiterService } from './recruiter.service.js';

const onboard = catchAsync(async (req, res) => {
  const { email, role } = req.body;
  const result = await RecruiterService.onboardUser(email, role);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User Onboarded',
    data: result,
  });
});

const trainingPlan = catchAsync(async (req, res) => {
  const { skillLevel, techStack } = req.body;
  const result = await RecruiterService.generateTrainingPlan(
    skillLevel,
    techStack,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Training Plan Generated',
    data: result,
  });
});

export const recruiterController = {
  onboard,
  trainingPlan,
};
