/**
 * Copyright (c) 2024 Inso Code
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
                const agentMap = {
                    'The Architect': 'architect',
                    'The Composer': 'composer',
                    'The Critic': 'critic',
                    'The Scribe': 'documentation',
                    'The Recruiter': 'onboarding',
                    'The Broadcaster': 'notification'
                };

                const mappedName = agentMap[task.agent] || task.agent.toLowerCase().replace(/[^a-z0-9]/g, '');
                const agentDef = agentRegistry.get(mappedName);

                if (agentDef && agentDef.instance && typeof agentDef.instance.consult === 'function') {
                    logger.info(`🎬 Director: Activating real specialist ${agentDef.name} for task: "${task.task}"`);
                    
                    const contextData = [
                        { path: 'mission_context.txt', content: `Mission Goal: ${mission.goal}\nTask Assignment: ${task.task}\nPrevious Results: ${JSON.stringify(mission.results)}` }
                    ];

                    const consultResult = await agentDef.instance.consult(task.task, contextData);
                    
                    task.status = 'completed';
                    task.result = typeof consultResult === 'object' && consultResult.content ? consultResult.content : consultResult;
                    mission.results[task.agent] = task.result;
                } else {
                    logger.warn(`🎬 Director: Specialist agent ${task.agent} (mapped: ${mappedName}) not found or has no active instance. Falling back to high-fidelity AI Gateway emulation...`);
                    
                    // Fallback to high-fidelity AI Gateway emulation
                    const prompt = `You are representing the specialist ${task.agent}.\nMission Goal: ${mission.goal}\nYour specific task: ${task.task}\nPrevious Results: ${JSON.stringify(mission.results)}`;
                    const response = await aiProvider.reason(prompt);
                    
                    task.status = 'completed';
                    task.result = response;
                    mission.results[task.agent] = response;
                }

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
