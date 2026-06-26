/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { surferAgent } from '../agents/surfer.agent.js';
import { finopsAgent } from '../agents/finops.agent.js';
import { sprintSchedulerService } from '../sprintScheduler/sprintScheduler.service.js';

/**
 * Phase 29: The Autonomous Board of Directors (Strategic Synthesis)
 * Allows the Swarm to self-originate its own Epics and Tasks based on live internet trends,
 * cloud costs, and codebase health.
 */
export class BoardOfDirectorsService {
  constructor() {
    this.name = 'BoardOfDirectorsService';
    this.personas = {
      ceo: 'You are the visionary CEO of Inso Code. Your goal is market dominance, user growth, and feature velocity.',
      cto: 'You are the pragmatic CTO. Your focus is system architecture, tech debt reduction, and ensuring sub-second latencies.',
      cfo: 'You are the quantitative CFO. Your focus is reducing cloud spend, optimizing FinOps, and ensuring the swarm operates within budget.',
    };
  }

  /**
   * Commences a simulated C-Suite Board Meeting to generate a new Epic.
   */
  async holdBoardMeeting() {
    logger.info(`🏛️ BoardOfDirectors: Convening autonomous C-Suite meeting...`);

    // 1. Gather Market Intelligence (CEO Perspective)
    let marketTrends = 'General software market optimization needed.';
    try {
      logger.info(
        `🏛️ BoardOfDirectors (CEO): Surfing HackerNews and X for emerging tech trends...`,
      );
      const trendData = await surferAgent.surfWeb(
        'Latest trends in AI, SaaS, and Developer Tools HackerNews',
      );
      marketTrends = trendData.synthesizedSolution || marketTrends;
    } catch (e) {
      logger.warn(
        `BoardOfDirectors (CEO) Market Intelligence failed: ${e.message}`,
      );
    }

    // 2. Gather Financial Intelligence (CFO Perspective)
    let finData = '';
    try {
      logger.info(
        `🏛️ BoardOfDirectors (CFO): Reviewing Multi-Cloud Burn Rates...`,
      );
      const finReport = await finopsAgent.execute('arbitrage', {
        query: 'Simulate AWS vs GCP current platform cost',
      });
      finData = finReport.recommendation || 'Cloud spend is nominal.';
    } catch (e) {
      logger.warn(
        `BoardOfDirectors (CFO) Financial Review failed: ${e.message}`,
      );
    }

    // 3. Synthesis and Epic Generation (The Board Vote)
    const prompt = `You are the combined intellect of the Inso Code Board of Directors (CEO, CTO, and CFO).
        
        Inputs for the meeting:
        [MARKET TRENDS]: ${marketTrends.substring(0, 1000)}
        [FINANCIAL STATE]: ${finData.substring(0, 1000)}
        
        Synthesize these inputs into a single, high-impact Autonomous Sprint Epic. 
        It must be an actionable software engineering goal (e.g. "Migrate analytics database to ClickHouse to save 40% on RDS costs").
        
        Return ONLY the raw string describing the next Sprint Goal. Do not include markdown or explanations.`;

    let epicGoal = '';
    try {
      epicGoal = await GeminiAiService.generateContent(prompt);
      epicGoal = epicGoal.trim();
    } catch (e) {
      logger.error(`BoardOfDirectors Synthesis failed: ${e.message}`);
      return null;
    }

    logger.info(
      `🏛️ BoardOfDirectors: Vote concluded. Unanimous Epic selected: "${epicGoal}"`,
    );

    // 4. Inject into the Swarm capability queue
    if (epicGoal) {
      await sprintSchedulerService.addGoalToBacklog(
        epicGoal,
        2,
        'BoardOfDirectors',
      );
      logger.info(
        `🏛️ BoardOfDirectors: Epic injected into Priority 2 Backlog.`,
      );
    }

    return epicGoal;
  }
}

export const boardOfDirectorsService = new BoardOfDirectorsService();
