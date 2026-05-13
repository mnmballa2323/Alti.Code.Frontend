/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Director" - Mission Control Agent
 * Successor to the Orchestrator. Manages complex missions, decomposes goals,
 * and assigns tasks to the specialist agents.
 */
import { logger } from '../../../shared/logger.js';
import { aiProvider } from '../ai/ai.provider.js';
import { agentRegistry } from '../agents/agent.registry.js';
import { v4 as uuidv4 } from 'uuid';

class DirectorAgent {
    constructor() {
        this.missions = new Map();
    }

    /**
     * Start a new mission from a high-level goal
     * @param {string} goal 
     * @param {object} context 
     */
    async startMission(goal, context = {}) {
        const missionId = uuidv4();
        logger.info(`🎬 Director: Action! Starting Mission ${missionId}: "${goal}"`);

        const mission = {
            id: missionId,
            goal,
            status: 'planning',
            tasks: [],
            results: {},
            context,
            startTime: new Date()
        };

        this.missions.set(missionId, mission);

        // 1. Decompose Goal
        await this.decomposeGoal(mission);

        // 2. Execute Tasks
        this.executeMission(mission); // Async execution

        return { missionId, status: 'started', goal };
    }

    /**
     * Decompose a goal into specific agent tasks using AI
     * @param {object} mission 
     */
    async decomposeGoal(mission) {
        logger.info(`🎬 Director: Decomposing goal for Mission ${mission.id}...`);

        const systemPrompt = `
            You are The Director, a master orchestrator of an AI agent team.
            Your goal is to break down a user objective into a sequential list of steps.
            
            Available Agents:
            - The Architect (Infrastructure, Docker)
            - The Composer (Coding, Implementation)
            - The Critic (Testing, QA)
            - The Scribe (Documentation)
            - The Recruiter (Onboarding)
            - The Broadcaster (Notifications)
            
            Return a JSON array of tasks. Each task must have:
            - agent: Name of the agent (e.g., "The Architect")
            - task: Detailed instruction for the agent
            
            User Goal: "${mission.goal}"
        `;

        try {
            const response = await aiProvider.reason(systemPrompt);
            // Robust JSON parsing
            const match = response.match(/\[[\s\S]*\]/);
            const tasks = match ? JSON.parse(match[0]) : [];

            mission.tasks = tasks.map(t => ({ ...t, status: 'pending', id: uuidv4() }));
            mission.status = 'ready';
            logger.info(`🎬 Director: Decomposed into ${mission.tasks.length} tasks.`);
        } catch (error) {
            logger.error(`🎬 Director: Failed to decompose goal`, error);
            mission.status = 'failed';
            mission.error = 'Decomposition failed';
        }
    }

    /**
     * Execute the mission tasks sequentially
     * @param {object} mission 
     */
    async executeMission(mission) {
        logger.info(`🎬 Director: Executing Mission ${mission.id}...`);
        mission.status = 'running';

        for (const task of mission.tasks) {
            if (mission.status === 'failed') break;

            logger.info(`🎬 Director: Assigning task to ${task.agent}: "${task.task}"`);
            task.status = 'in-progress';
            task.startTime = new Date();

            try {
                // Determine the correct service method based on agent name
                // In a real implementation, this would be dynamic.
                // For now, we simulate execution or route to specific services if imported.

                // MOCK EXECUTION for Stability
                await new Promise(resolve => setTimeout(resolve, 500));

                task.status = 'completed';
                task.result = 'Task executed successfully (Mock)';
                task.endTime = new Date();

            } catch (error) {
                logger.error(`🎬 Director: Task failed`, error);
                task.status = 'failed';
                task.error = error.message;
                mission.status = 'failed';
            }
        }

        if (mission.status !== 'failed') {
            mission.status = 'completed';
            mission.endTime = new Date();
            logger.info(`🎬 Director: Cut! Mission ${mission.id} completed.`);
        }
    }

    /**
     * Get the status of a mission
     * @param {string} missionId 
     */
    getMissionStatus(missionId) {
        return this.missions.get(missionId) || { status: 'not-found' };
    }
}

export const directorAgent = new DirectorAgent();
