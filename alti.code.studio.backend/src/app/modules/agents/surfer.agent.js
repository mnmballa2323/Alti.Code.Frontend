/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { browserUseService } from '../senses/browser_use.service.js';

/** Shared JSON cleaner used by multiple agent methods. */
const parseAgentJson = raw => {
  const cleaned = raw
    .replace(/^```json\n?/m, '')
    .replace(/^```\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim();
  return JSON.parse(cleaned);
};

export class SurferAgent {
  constructor() {
    this.name = 'surfer';
    this.description = 'Live Web Intelligence and Open-Source OSINT gatherer';
    this.capabilities = [
      'Break LLM knowledge cutoff dates by searching the live web',
      'Parse StackOverflow threads and GitHub Issues to resolve undocumented compiler errors',
      'Synthesize documentation from live HTTP sites into the memory context vector',
    ];
  }

  /**
   * Executes a simulated headless-browser search and returns a structured report.
   * Falls back to a safe error object rather than throwing, so the graph can continue.
   *
   * @param {string} searchContext - Error message or concept to research
   * @returns {Promise<object>}
   */
  async surfWeb(searchContext) {
    if (
      !searchContext ||
      typeof searchContext !== 'string' ||
      searchContext.trim().length === 0
    ) {
      throw new Error('SurferAgent: searchContext must be a non-empty string.');
    }

    logger.info(
      `🌊 Surfer Agent: Dispatching autonomous browser for search vector: [${searchContext.substring(0, 80)}]...`,
    );

    try {
      // 1. Live Autonomous Browser Execution via Python Bridge
      const browserTask = `Search the live web (e.g., Google or DuckDuckGo) to investigate and summarize the following issue or concept: "${searchContext.replace(/"/g, '\\"')}". Navigate to 1 or 2 relevant search results (like StackOverflow, GitHub issues, or official docs), read the contents, and synthesize the solution.`;

      logger.info(`🌊 Surfer Agent: Booting Playwright & Browser-Use...`);
      const browserOutput = await browserUseService.executeBrowserTask(
        browserTask,
        true,
      );

      // 2. Format / Synthesize with Gemini to maintain strict schema for the graph
      const prompt = `
            You are "The Surfer", a live OSINT intelligence agent. The user encountered an unknown issue or concept: "${searchContext}".
            I just deployed an autonomous AI browser to investigate this for you. Here is the raw final output from the browser runtime:
            
            ${browserOutput}
            
            Synthesize what the browser found regarding this specific issue. Deduplicate knowledge.
            
            Return your findings as a strict JSON object (no markdown fences):
            {
                "searchVector": "The query investigated",
                "sourcesChecked": ["Live Autonomous Browser Session"],
                "synthesizedSolution": "A 2-sentence summary of the fix or concept based on the browser's findings.",
                "codeSnippetFound": "A relevant code snippet (if any) found, or null if none."
            }
            `;

      const rawResponse = await GeminiAiService.generateContent(prompt);

      let surferReport;
      try {
        surferReport = parseAgentJson(rawResponse);
      } catch (parseErr) {
        logger.warn(
          `🌊 Surfer Agent: JSON parse failed — returning raw text as synthesizedSolution.`,
        );
        surferReport = {
          searchVector: searchContext,
          sourcesChecked: [],
          synthesizedSolution: rawResponse.substring(0, 500),
          codeSnippetFound: null,
        };
      }

      logger.info(
        `🌊 Surfer Agent: Scraping complete. Sources checked: ${surferReport.sourcesChecked?.length ?? 0}`,
      );
      logger.info(`   Knowledge Harvest: ${surferReport.synthesizedSolution}`);

      return surferReport;
    } catch (err) {
      logger.error(`❌ Surfer Agent Execution Failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Graph-compatible process() — catches errors and returns a failed-step object
   * instead of propagating an uncaught exception that would crash the graph.
   *
   * @param {object} state
   * @returns {Promise<object>}
   */
  async process(state) {
    const query =
      state.data?.content || state.goal || 'React 19 Hooks documentation';

    try {
      const report = await this.surfWeb(query);
      return {
        ...state,
        status: 'success',
        results: [
          ...(state.results ?? []),
          `Web Intelligence gathered: ${report.synthesizedSolution}`,
        ],
      };
    } catch (err) {
      logger.error(`🌊 SurferAgent.process() failed: ${err.message}`);
      return {
        ...state,
        status: 'failed',
        error: err.message,
        results: [
          ...(state.results ?? []),
          `❌ FAILED SurferAgent: ${err.message}`,
        ],
      };
    }
  }
}

export const surferAgent = new SurferAgent();
