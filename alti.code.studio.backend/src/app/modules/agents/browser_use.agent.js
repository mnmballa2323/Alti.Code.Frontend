/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Browser Operator" — Tier 13 Micro-Specialist
 * A Swarm Agent dedicated entirely to interacting with web browsers on the
 * host operating system via physical or headless browser actions,
 * powered by the Browser-Use agent framework.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { BrowserUseAgentService } from '../browserUseAgent/browserUseAgent.service.js';
import { logger } from '../../../shared/logger.js';

class BrowserUseAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'BrowserUse';
    this.description = 'The Browser Operator';
    this.tier = 'Tier 13';
  }

  async _invoke(context, contextBlock) {
    let goal;
    let isDirectInvoke = false;
    let options = {};

    if (typeof context === 'object' && context !== null) {
      goal = context.goal || context.task;
      isDirectInvoke = true;
      options = {
        headless: context.headless,
        chromePath: context.chromePath || context.chrome_path,
        userDataDir: context.userDataDir || context.user_data_dir,
        proxy: context.proxy,
      };
    } else if (typeof context === 'string') {
      goal = context;
    }

    if (!goal) {
      throw new Error('Goal prompt is required for Browser-Use execution.');
    }

    logger.info(
      `🤖 Browser Operator: Receiving swarm intent for browser automation control: "${goal}"`,
    );

    try {
      const output = await BrowserUseAgentService.runBrowserTask(goal, options);

      if (isDirectInvoke) {
        return output;
      }

      return typeof output === 'string'
        ? output
        : JSON.stringify(output, null, 2);
    } catch (error) {
      logger.error(
        `❌ Browser Operator: Browser-Use execution failed: ${error.message}`,
      );
      throw error;
    }
  }

  async runBrowserTask(taskDescription, options = {}) {
    if (typeof taskDescription === 'object' && taskDescription !== null) {
      const args = taskDescription;
      const taskOptions = {
        headless: args.headless,
        chromePath: args.chromePath || args.chrome_path,
        userDataDir: args.userDataDir || args.user_data_dir,
        proxy: args.proxy,
        ...options,
      };
      return BrowserUseAgentService.runBrowserTask(
        args.task || args.goal || args.query,
        taskOptions,
      );
    }
    return BrowserUseAgentService.runBrowserTask(taskDescription, options);
  }

  async getBrowserTaskStatus(taskId) {
    if (typeof taskId === 'object' && taskId !== null) {
      const args = taskId;
      return BrowserUseAgentService.getBrowserTaskStatus(args.taskId);
    }
    return BrowserUseAgentService.getBrowserTaskStatus(taskId);
  }

  async cancelBrowserTask(taskId) {
    if (typeof taskId === 'object' && taskId !== null) {
      const args = taskId;
      return BrowserUseAgentService.cancelBrowserTask(args.taskId);
    }
    return BrowserUseAgentService.cancelBrowserTask(taskId);
  }

  async getBrowserSessions() {
    return BrowserUseAgentService.getBrowserSessions();
  }

  async getScreenshot(taskId, step) {
    if (typeof taskId === 'object' && taskId !== null) {
      const args = taskId;
      return BrowserUseAgentService.getScreenshot(
        args.taskId,
        args.step || 'latest',
      );
    }
    return BrowserUseAgentService.getScreenshot(taskId, step || 'latest');
  }

  async getPageSource(taskId) {
    if (typeof taskId === 'object' && taskId !== null) {
      const args = taskId;
      return BrowserUseAgentService.getPageSource(args.taskId);
    }
    return BrowserUseAgentService.getPageSource(taskId);
  }
}

export const browserUseAgent = new BrowserUseAgent();
