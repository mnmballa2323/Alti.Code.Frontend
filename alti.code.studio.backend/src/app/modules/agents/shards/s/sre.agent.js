// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { sprintSchedulerService } from '../sprintScheduler/sprintScheduler.service.js';
import { guardianAgent } from './guardian.agent.js';
import { vectorStoreService } from '../memory/vector.store.js';

/**
 * Phase 22: Autonomous SRE & Production Self-Healing
 */
class SREAgent extends BaseSpecialistAgent {
    constructor() {
        super(
            'SREAgent',
            'SRE/DevOps',
            'High',
            'Autonomous Site Reliability Engineer. Responds to Sev-1 incidents, identifies root causes from production telemetry, and synthesizes hotfix sprint goals.',
            'expert'
        );
    }

    /**
     * Core Incident Response Subroutine
     * Triages a live anomaly and injects a Priority 0 Hotfix Sprint Goal if deemed critical.
     * @param {Object} incident
     */
    async triageIncident(incident) {
        logger.warn(`🚨 SREAgent: Triaging Incident [${incident.id}]...`);

        const systemPrompt = `
You are the elite Site Reliability Engineer (SRE) for the Genesis Swarm.
A production incident has been escalated to you:
Type: ${incident.anomaly?.type || 'Unknown'}
Severity: ${incident.anomaly?.severity || 'HIGH'}
Message: ${incident.anomaly?.message || ''}
Context: ${incident.anomaly?.context || incident.webInsight || 'None'}

Your job is to determine the exact, highly-targeted technical Sprint Goal required
for the development swarm to autonomously deploy a hotfix for this issue right now.

Respond with ONLY the sprint goal sentence. No JSON, no markdown.
        `;

        try {
            const synthesizedFix = (await GeminiAiService.generateContent(systemPrompt)).trim().replace(/^"|"$/g, '');
            logger.info(`🚨 SREAgent: Fix Subroutine Synthesized: "${synthesizedFix}"`);

            // Guardian Safety Check
            const safetyCheck = await guardianAgent.interceptExecution(`SRE HOTFIX: ${synthesizedFix}`, 'HOTFIX_DEPLOYMENT');

            if (!safetyCheck.isSafeToExecute) {
                logger.error(`🚨 SREAgent: Hotfix vetoed by Guardian: ${safetyCheck.vetoReason}`);
                return { success: false, reason: 'Guardian Veto' };
            }

            // Inject as Priority 0 (Absolute Highest) to preempt any existing sprint schedule
            sprintSchedulerService.addGoalToBacklog(`[Sev-1 Hotfix] ${synthesizedFix}`, 0);
            logger.warn(`🚨 SREAgent: ⚡ PRIORITY 0 HOTFIX INJECTED INTO SCHEDULE ⚡`);

            // Log to corporate memory brain
            await vectorStoreService.add(`SRE Hotfix Response to Incident ${incident.id}: ${synthesizedFix}`, {
                type: 'sre_hotfix',
                incidentId: incident.id,
                severity: incident.anomaly?.severity || 'HIGH'
            });

            return { success: true, goal: synthesizedFix };

        } catch (error) {
            logger.error(`SREAgent Triaging Failed: ${error.message}`);
            return { success: false, reason: error.message };
        }
    }
}

export const sreAgent = Object.freeze(new SREAgent());
