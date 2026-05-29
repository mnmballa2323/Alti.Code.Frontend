import httpStatus from 'http-status';
import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import { SkillOptService } from './skillopt.service.js';
import { Skill, SkillOptRun } from './skillopt.model.js';
import ApiError from '../../../errors/ApiError.js';

const optimizeSkill = catchAsync(async (req, res) => {
    const { skillName, initialInstructions, dataset, maxEpochs = 3 } = req.body;

    if (!skillName || !initialInstructions || !dataset || !Array.isArray(dataset) || dataset.length === 0) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Missing required parameters: skillName, initialInstructions, and a non-empty dataset array'
        );
    }

    // Trigger optimization run in background
    // We execute it asynchronously so we can return a 202 Accepted immediately
    // without blocking the HTTP request thread.
    const run = await SkillOptRun.create({
        skillName,
        initialSystemInstruction: initialInstructions,
        parameters: { maxEpochs }
    });

    SkillOptService.optimizeSkill(skillName, initialInstructions, dataset, { maxEpochs })
        .then(async ({ run: completedRun }) => {
            console.log(`[SkillOpt] Optimization run ${completedRun._id} completed successfully.`);
        })
        .catch(async (err) => {
            console.error(`[SkillOpt] Optimization run failed: ${err.message}`);
        });

    sendResponse(res, {
        statusCode: httpStatus.ACCEPTED,
        success: true,
        message: 'SkillOpt instruction optimization triggered in background',
        data: {
            runId: run._id,
            skillName,
            status: run.status
        }
    });
});

const getRunStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const run = await SkillOptRun.findById(id);

    if (!run) {
        throw new ApiError(httpStatus.NOT_FOUND, `SkillOpt run [${id}] not found`);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'SkillOpt run telemetry fetched successfully',
        data: run
    });
});

const getSkill = catchAsync(async (req, res) => {
    const { name } = req.params;
    const skill = await Skill.findOne({ name });

    if (!skill) {
        throw new ApiError(httpStatus.NOT_FOUND, `Skill [${name}] not found in catalogue`);
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Active skill instructions retrieved successfully',
        data: skill
    });
});

const getRuns = catchAsync(async (req, res) => {
    const runs = await SkillOptRun.find().sort({ createdAt: -1 });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Historical SkillOpt runs listed successfully',
        data: runs
    });
});

export const SkillOptController = {
    optimizeSkill,
    getRunStatus,
    getSkill,
    getRuns
};
