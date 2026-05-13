import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { DirectorService } from './director.service.js';

const startMission = catchAsync(async (req, res) => {
    const { goal, context } = req.body;
    const result = await DirectorService.startMission(goal, context);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Mission Started',
        data: result,
    });
});

const getMissionStatus = catchAsync(async (req, res) => {
    const { missionId } = req.params;
    const result = await DirectorService.getMissionStatus(missionId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Mission Status Retrieved',
        data: result,
    });
});

export const directorController = {
    startMission,
    getMissionStatus
};
