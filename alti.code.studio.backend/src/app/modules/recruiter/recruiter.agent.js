/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Recruiter" - Onboarding & HR Agent
 * Responsible for welcoming new developers, generating training plans, and managing team integration.
 */
import { logger } from '../../../shared/logger.js';
import { aiProvider } from '../ai/ai.provider.js';

class RecruiterAgent {
    constructor() {
        this.onboardedUsers = new Set();
    }

    /**
     * Onboard a new team member
     * @param {string} email 
     * @param {string} role e.g. 'Backend Dev'
     */
    async onboardUser(email, role) {
        logger.info(`🤝 Recruiter: Onboarding ${email} as ${role}...`);

        // In a real app, this would trigger emails, create accounts, etc.
        this.onboardedUsers.add(email);

        const prompt = `
        You are "The Recruiter".
        Draft a warm, professional Welcome Email for a new ${role}.
        Include 3 key first-day tasks.
        
        OUTPUT Text.
        `;

        const welcomeMessage = await aiProvider.generate(prompt);
        return { status: 'onboarded', email, role, message: welcomeMessage };
    }

    /**
     * Generate a personalized training plan
     * @param {string} skillLevel 'Junior', 'Senior'
     * @param {string} techStack e.g. 'Node.js, React'
     */
    async generateTrainingPlan(skillLevel, techStack) {
        logger.info(`🤝 Recruiter: Creating training plan for ${skillLevel} dev in ${techStack}...`);

        const prompt = `
        You are "The Recruiter".
        Create a 1-week Training Plan for a ${skillLevel} Developer learning ${techStack}.
        Break it down by Day 1-5.
        
        OUTPUT JSON:
        {
            "weekGoal": "string",
            "schedule": [
                { "day": 1, "topic": "string", "tasks": ["string"] }
            ]
        }
        `;

        try {
            const response = await aiProvider.reason(prompt);
            const match = response.match(/\{[\s\S]*\}/);
            const plan = JSON.parse(match ? match[0] : response);
            return plan;
        } catch (error) {
            logger.error('🤝 Recruiter failed to gen plan', error);
            return { error: 'Plan generation failed' };
        }
    }
}

export const recruiterAgent = new RecruiterAgent();
