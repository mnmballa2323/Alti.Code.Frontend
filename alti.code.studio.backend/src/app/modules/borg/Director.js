import { maestro } from './Maestro.js';
import { logger } from '../../../shared/logger.js'; // Use shared logger instead of mock
import { v4 as uuidv4 } from 'uuid';

/**
 * Director: Core Agent Orchestrator
 * Manages the lifecycle of an autonomous task: Plan -> Execute -> Review.
 */
class Director {
    constructor() {
        this.activeMissions = new Map();
    }

    /**
     * Starts a new autonomous mission.
     * @param {string} goal - High level objective
     * @param {string} userId - User initiating the task
     */
    async startMission(goal, userId) {
        const missionId = uuidv4();
        logger.info(`Director starting mission ${missionId} for user ${userId}`);

        const missionState = {
            id: missionId,
            goal,
            status: 'provisioning',
            logs: [],
            worktreePath: null,
        };
        this.activeMissions.set(missionId, missionState);

        // Async execution loop
        this._executeMission(missionId).catch(err => {
            logger.error(`Mission ${missionId} crashed: ${err.message}`);
            this.updateMissionStatus(missionId, 'failed', err.message);
        });

        return missionId;
    }

    async _executeMission(missionId) {
        const mission = this.activeMissions.get(missionId);

        // 1. Provision Environment
        mission.status = 'provisioning';
        try {
            mission.worktreePath = await maestro.provisionWorktree(missionId);
            this.log(missionId, `Environment provisioned at ${mission.worktreePath}`);
        } catch (e) {
            this.log(missionId, `Provisioning failed: ${e.message}`);
            // Non-fatal fallback for now, or fatal?
            // throw e; 
            // Turning off fatal for now to allow partial execution in dev
        }

        // 2. Planning (Mocked for now)
        mission.status = 'planning';
        this.log(missionId, "Analyzing goal and creating plan...");
        await new Promise(r => setTimeout(r, 1000)); // Simulate think time

        // 3. Execution (Mocked loop)
        mission.status = 'executing';
        this.log(missionId, "Executing steps...");

        // TODO: Here we would instantiate the Agent loop (e.g. LangChain or custom loop)
        // For now, we simulate success
        await new Promise(r => setTimeout(r, 2000));

        // 4. Finalize
        mission.status = 'completed';
        this.log(missionId, "Mission accomplished.");

        // Cleanup
        // await maestro.cleanupWorktree(missionId); // Optional: keep for review
    }

    log(missionId, message) {
        const mission = this.activeMissions.get(missionId);
        if (mission) {
            mission.logs.push({ timestamp: new Date(), message });
            logger.info(`[Director:${missionId}] ${message}`);
        }
    }

    getMissionStatus(missionId) {
        return this.activeMissions.get(missionId);
    }

    updateMissionStatus(missionId, status, error = null) {
        const mission = this.activeMissions.get(missionId);
        if (mission) {
            mission.status = status;
            if (error) mission.error = error;
        }
    }
}

export const director = new Director();
