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
    super();
    this.name = 'AgentS';
    this.description = 'The GUI Operator';
    this.tier = 'Tier 13';
  }

  async _invoke(context, contextBlock) {
    let goal;
    let isDirectInvoke = false;

    if (typeof context === 'object' && context !== null) {
      goal = context.goal;
      isDirectInvoke = true;
    } else if (typeof context === 'string') {
      goal = context;
    }

    if (!goal) {
      throw new Error('Goal prompt is required for Agent-S GUI execution.');
    }

    logger.info(
      `🤖 GUI Operator: Receiving swarm intent for graphical desktop control: "${goal}"`,
    );

    try {
      const options = {
        dryRun:
          context.dryRun !== undefined
            ? context.dryRun
            : context.dry_run !== undefined
              ? context.dry_run
              : true,
        maxSteps: context.maxSteps || context.max_steps || 8,
      };

      // Forward the goal instruction directly to the Simular AI Agent-S multimodal framework
      const guiOutput = await agentSService.executeGUITask(goal, options);
      const outputResult =
        typeof guiOutput === 'object' ? guiOutput.result : guiOutput;
      const trajectory =
        typeof guiOutput === 'object' ? guiOutput.trajectory : [];

      if (isDirectInvoke) {
        return {
          status: 'success',
          agent: this.name,
          s_action: outputResult,
          trajectory: trajectory,
          message: `Task successfully executed via autonomous GUI interactions (Mouse/Keyboard).`,
        };
      }

      return JSON.stringify(
        {
          status: 'success',
          agent: this.name,
          s_action: outputResult,
          trajectory: trajectory,
          message: `Task successfully executed via autonomous GUI interactions (Mouse/Keyboard).`,
        },
        null,
        2,
      );
    } catch (error) {
      logger.error(
        `❌ GUI Operator: Agent-S execution failed: ${error.message}`,
      );
      if (isDirectInvoke) {
        return {
          status: 'error',
          agent: this.name,
          error: error.message,
          message: 'Failed to complete GUI interaction task.',
        };
      }
      throw error;
    }
  }

  async cancelGUITask(taskId) {
    if (typeof taskId === 'object' && taskId !== null) {
      const args = taskId;
      return agentSService.cancelGUITask(args.taskId);
    }
    return agentSService.cancelGUITask(taskId);
  }

  async checkSystemDiagnostics() {
    return agentSService.checkSystemDiagnostics();
  }
}

export const agentSAgent = new AgentSAgent();
