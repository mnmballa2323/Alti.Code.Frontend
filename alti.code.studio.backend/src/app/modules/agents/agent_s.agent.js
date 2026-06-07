/**
 * Copyright (c) 2024 Inso Code
 *
 * "The GUI Operator" — Tier 13 Micro-Specialist
 * A Swarm Agent dedicated entirely to interacting with graphical user 
 * interfaces on the host operating system via physical mouse/keyboard actions,
 * powered by the Agent S multimodal framework.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentSService } from '../senses/agent_s.service.js';
import { logger } from '../../../shared/logger.js';

class AgentSAgent extends BaseSpecialistAgent {
    constructor() {
        super('AgentS', 'The GUI Operator', 'Tier 13');
    }

    async _invoke(context) {
        logger.info(`🤖 GUI Operator: Receiving swarm intent for graphical desktop control: "${context.goal}"`);

        try {
            // Forward the goal instruction directly to the Simular AI Agent-S multimodal framework
            const guiOutput = await agentSService.executeGUITask(context.goal);

            return {
                status: 'success',
                agent: this.name,
                s_action: guiOutput,
                message: `Task successfully executed via autonomous GUI interactions (Mouse/Keyboard).`
            };
        } catch (error) {
            logger.error(`❌ GUI Operator: Agent-S execution failed: ${error.message}`);
            return {
                status: 'error',
                agent: this.name,
                error: error.message,
                message: 'Failed to complete GUI interaction task.'
            };
        }
    }
}

export const agentSAgent = new AgentSAgent();
