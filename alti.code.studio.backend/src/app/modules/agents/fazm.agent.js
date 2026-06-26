/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Desktop Voice Operator" — Tier 13 Micro-Specialist
 * A Swarm Agent dedicated entirely to interacting with the host operating
 * system desktop via the local or peer-to-peer connected Fazm AI Agent,
 * triggered via voice or text intents.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { FazmAgentService } from '../fazmAgent/fazmAgent.service.js';
import { logger } from '../../../shared/logger.js';

class FazmAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Fazm';
    this.description = 'The Desktop Voice Operator';
    this.tier = 'Tier 13';
  }

  async _invoke(context, contextBlock) {
    let goal;
    let userId = 'default-user';
    let isDirectInvoke = false;

    if (typeof context === 'object' && context !== null) {
      goal = context.goal || context.task;
      userId = context.userId || context.uid || userId;
      isDirectInvoke = true;
    } else if (typeof context === 'string') {
      goal = context;
    }

    if (!goal) {
      throw new Error('Goal prompt is required for Fazm desktop automation.');
    }

    logger.info(
      `🤖 Fazm Operator: Receiving swarm intent for desktop automation: "${goal}"`,
    );

    try {
      const output = await FazmAgentService.runTask(userId, goal);

      if (isDirectInvoke) {
        return output;
      }

      return typeof output === 'string'
        ? output
        : JSON.stringify(output, null, 2);
    } catch (error) {
      logger.error(`❌ Fazm Operator: Fazm execution failed: ${error.message}`);
      throw error;
    }
  }

  async runTask(userId, taskDescription) {
    if (typeof userId === 'object' && userId !== null && !taskDescription) {
      const args = userId;
      return FazmAgentService.runTask(
        args.userId || 'default-user',
        args.task || args.goal || args.query,
      );
    }
    return FazmAgentService.runTask(userId, taskDescription);
  }

  async getStatus(userId, taskId) {
    if (typeof userId === 'object' && userId !== null && !taskId) {
      const args = userId;
      return FazmAgentService.getStatus(
        args.userId || 'default-user',
        args.taskId,
      );
    }
    return FazmAgentService.getStatus(userId, taskId);
  }
}

export const fazmAgent = new FazmAgent();
