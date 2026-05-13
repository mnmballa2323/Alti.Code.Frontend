import { recruiterAgent } from './recruiter.agent.js';
import { logger } from '../../../shared/logger.js';

const onboardUser = async (email, role) => {
    return await recruiterAgent.onboardUser(email, role);
};

const generateTrainingPlan = async (skillLevel, techStack) => {
    return await recruiterAgent.generateTrainingPlan(skillLevel, techStack);
};

export const RecruiterService = {
    onboardUser,
    generateTrainingPlan
};
