// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import crypto from 'crypto';
import { logger } from '../../../../shared/logger.js';
import { graphOrchestrator } from './graph.orchestrator.js';
import { redisClient } from '../../../shared/redis.client.js';

/** Maximum time (ms) to wait for a mission to complete before rejecting. */
const MISSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const MISSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

class OrchestratorAgent {
    /** Helper structure for redis keys */
    _missionKey(traceId) {
        return `orchestrator:mission:${traceId}`;
    }

    /** Helper to stringify nested mission fields for redis hash */
    _serializeMission(mission) {
        const flat = {};
        for (const [k, v] of Object.entries(mission)) {
            if (v instanceof Date) {
                flat[k] = v.toISOString();
            } else if (typeof v === 'object' && v !== null) {
                flat[k] = JSON.stringify(v);
            } else {
                flat[k] = String(v);
            }
        }
        return flat;
    }

    /** Helper to parse a mission retrieved from redis */
    _deserializeMission(missionFields) {
        if (!missionFields || Object.keys(missionFields).length === 0) return null;

        const mission = { ...missionFields };
        if (mission.startedAt) mission.startedAt = new Date(mission.startedAt);
        if (mission.completedAt) mission.completedAt = new Date(mission.completedAt);
        if (mission.failedAt) mission.failedAt = new Date(mission.failedAt);
        if (mission.completed_steps) {
            try { mission.completed_steps = JSON.parse(mission.completed_steps); } catch (e) { }
        }
        return mission;
    }

    async execute(goal, userId, sessionId = `mission-${crypto.randomUUID()}`) {
        const traceId = crypto.randomUUID();
        logger.info(`🐝 Orchestrator: Receiving goal: "${goal}" [TraceID: ${traceId}]`);

        const missionKey = this._missionKey(traceId);

        const initialMission = {
            status: 'pending',
            goal,
            userId,
            sessionId,
            startedAt: new Date()
        };

        const serializedMission = this._serializeMission(initialMission);
        await redisClient.hsetobj(missionKey, serializedMission);
        // We do not have expire on hsetobj directly in our wrapper,
        // but we can set expiry manually, or just leave it persistent.
        // We'll leave it persistent for now.

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error(`Mission timed out after ${MISSION_TIMEOUT_MS / 1000}s`)),
                MISSION_TIMEOUT_MS
            )
        );

        try {
            const results = await Promise.race([
                graphOrchestrator.run(goal),
                timeoutPromise,
            ]);

            const completedMission = {
                status: 'success',
                completed_steps: results,
                traceId,
                sessionId,
                completedAt: new Date(),
            };

            const updatedMission = { ...initialMission, ...completedMission };
            await redisClient.hsetobj(missionKey, this._serializeMission(updatedMission));

            logger.info(`✅ Orchestrator: Mission complete [TraceID: ${traceId}]`);
            return updatedMission;

        } catch (error) {
            const isTimeout = error.message.includes('timed out');
            const failedMission = {
                status: isTimeout ? 'timeout' : 'failed',
                error: error.message,
                traceId,
                sessionId,
                failedAt: new Date(),
            };

            const updatedMission = { ...initialMission, ...failedMission };
            await redisClient.hsetobj(missionKey, this._serializeMission(updatedMission));

            logger.error(`❌ Orchestrator ${isTimeout ? 'Timeout' : 'Failed'} [TraceID: ${traceId}]`, error);
            throw error;
        }
    }

    async getMissionStatus(traceId) {
        const data = await redisClient.hgetall(this._missionKey(traceId));
        return this._deserializeMission(data);
    }

    async listMissions() {
        const keys = await redisClient.keys('orchestrator:mission:*');
        if (!keys || keys.length === 0) return [];

        const missions = [];
        for (const key of keys) {
            const data = await redisClient.hgetall(key);
            const mission = this._deserializeMission(data);
            if (mission) {
                // Infer traceId from key since we didn't store it in the pending state
                mission.traceId = key.replace('orchestrator:mission:', '');
                missions.push(mission);
            }
        }

        // Sort most recent first
        missions.sort((a, b) => b.startedAt - a.startedAt);
        return missions.slice(0, 100);
    }
}

export const Orchestrator = Object.freeze(new OrchestratorAgent());
