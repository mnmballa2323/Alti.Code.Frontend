/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { StateGraph, END, Send } from '@langchain/langgraph';
import { logger } from '../../../shared/logger.js';
import { architectureAgent } from './architecture.agent.js';
import { performanceAgent } from './performance.agent.js';
import { redteamAgent } from './redteam.agent.js'; // Specialized security

// ── Formal Debate State ───────────────────────────────────────────────────────
const consensusState = {
  proposedPatch: { value: (x, y) => y, default: () => null },
  targetFile: { value: (x, y) => y, default: () => '' },
  evaluators: {
    value: (x, y) => y,
    default: () => ['architect', 'performance', 'security'],
  },
  evaluator: { value: (x, y) => y, default: () => null },
  votes: { value: (x, y) => x.concat(y), default: () => [] },
  isApproved: { value: (x, y) => y, default: () => false },
};

class ConsensusOrchestrator {
  constructor() {
    this.app = null;
    this.init();
  }

  init() {
    const workflow = new StateGraph({ channels: consensusState });

    workflow.addNode('dispatch', this.dispatchNode.bind(this));
    workflow.addNode('evaluate', this.evaluateNode.bind(this));
    workflow.addNode('tally', this.tallyNode.bind(this));

    // Start -> Dispatch
    workflow.addEdge('dispatch', 'evaluate'); // Actually we'll use conditional edge for Send

    workflow.addConditionalEdges('dispatch', state => {
      return state.evaluators.map(
        evaluator => new Send('evaluate', { evaluator }),
      );
    });

    workflow.addEdge('evaluate', 'tally');
    workflow.addEdge('tally', END);

    workflow.setEntryPoint('dispatch');
    this.app = workflow.compile();
  }

  async dispatchNode(state) {
    logger.info(`⚖️ Consensus: Dispatching AST patch for formal debate...`);
    return {};
  }

  async evaluateNode(state) {
    const { evaluator, proposedPatch, targetFile } = state;
    if (!evaluator || !proposedPatch) return {};

    logger.info(`⚖️ Consensus: ${evaluator} reviewing patch for ${targetFile}`);

    let agent;
    let prompt = `Review this AST Patch for ${targetFile}.\nPatch:\n${JSON.stringify(proposedPatch, null, 2)}\n`;

    if (evaluator === 'architect') {
      agent = architectureAgent;
      prompt +=
        'As the Architect, ensure this patch does not violate SOLID principles or break dependency boundaries. Return STRICT JSON: { "approved": true|false, "reason": "..." }';
    } else if (evaluator === 'performance') {
      agent = performanceAgent;
      prompt +=
        'As the Performance expert, ensure this patch does not introduce O(N^2) loops or memory leaks. Return STRICT JSON: { "approved": true|false, "reason": "..." }';
    } else {
      // Assume security/redteam
      agent = redteamAgent;
      prompt +=
        'As the RedTeam Security expert, ensure this patch is free from injection, XSS, and unhandled panics. Return STRICT JSON: { "approved": true|false, "reason": "..." }';
    }

    try {
      // Fallback if agent is missing in this context
      if (!agent) {
        return {
          votes: [
            {
              evaluator,
              approved: true,
              reason: 'Auto-approved (Agent missing in scope)',
            },
          ],
        };
      }

      const response = await agent.consult(prompt);
      const clean = response.replace(/```json\n?|```/g, '').trim();
      const result = JSON.parse(clean);

      return {
        votes: [
          { evaluator, approved: result.approved, reason: result.reason },
        ],
      };
    } catch (e) {
      logger.warn(`Consensus evaluation failed for ${evaluator}: ${e.message}`);
      return {
        votes: [
          {
            evaluator,
            approved: false,
            reason: `Evaluation Exception: ${e.message}`,
          },
        ],
      };
    }
  }

  async tallyNode(state) {
    logger.info(`⚖️ Consensus: Tallying votes...`);
    const { votes } = state;

    let approvedCount = 0;
    let rejections = [];

    for (const v of votes) {
      if (v.approved) approvedCount++;
      else rejections.push(`[${v.evaluator}] ${v.reason}`);
    }

    const isApproved = approvedCount === state.evaluators.length;

    if (isApproved) {
      logger.info(
        `✅ Consensus Reached: Patch approved by all ${approvedCount} specialized agents.`,
      );
    } else {
      logger.error(
        `❌ Consensus Failed: Patch rejected by ${rejections.length} agent(s). Reasons:\n${rejections.join('\n')}`,
      );
    }

    return { isApproved };
  }

  /**
   * Run formal consensus debate on an AST patch
   * @param {Object} patch
   * @param {string} targetFile
   * @returns {Promise<{isApproved: boolean, votes: Array}>}
   */
  async debatePatch(patch, targetFile) {
    const initialState = {
      proposedPatch: patch,
      targetFile: targetFile,
      evaluators: ['architect', 'performance', 'security'],
      votes: [],
    };
    const result = await this.app.invoke(initialState);
    return {
      isApproved: result.isApproved,
      votes: result.votes,
    };
  }
}

export const consensusOrchestrator = new ConsensusOrchestrator();
