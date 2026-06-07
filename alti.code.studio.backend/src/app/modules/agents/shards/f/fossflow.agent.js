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
import { fossflowService } from './fossflow.service.js';

class FossFlowAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'fossflow';
        this.description = 'Autonomous Isometric Architecture Designer powered by FossFLOW and Isoflow.';
        this.preamble = 'You are an architecture design agent for the FossFLOW framework. You generate, manage, and edit isometric architectural diagrams for complex distributed systems and applications.';
    }

    /**
     * Overrides _invoke to dispatch the task to the FossFLOW API service
     * @param {string} prompt
     * @param {string} contextBlock
     */
    async _invoke(prompt, contextBlock) {
        const diagramResult = await fossflowService.generateArchitecture(prompt, contextBlock);

        return `
================ FossFLOW Architecture Design ================
Status: ${diagramResult.status}
Diagram ID: ${diagramResult.id}
Canvas URL: ${diagramResult.dashboardUrl}
Note: Your interactive isometric architecture diagram is ready.
==============================================================`;
    }
}

export const fossflowAgent = Object.freeze(new FossFlowAgent());
