/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import {
  capabilityRouter,
  CAPABILITY_TABLE,
} from '../agents/capability.router.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Phase 30: The Biomimetic Neural Net (Self-Evolving Routing)
 * Replaces static keyword routing with Reinforcement Learning connection weights.
 * The Swarm learns which agents are actually best at solving specific classes of problems
 * by adjusting neural pathway weights based on past Sprint Review scores.
 */
export class NeuralRouterService {
  constructor() {
    this.name = 'NeuralRouterService';
    this.connectionWeights = new Map(); // Map<agentId, weight>
    this.WEIGHTS_FILE = path.join(
      process.cwd(),
      '.alti',
      'neural_weights.json',
    );

    // Base starting weight for all agents
    this.BASE_WEIGHT = 1.0;
    this.LEARNING_RATE = 0.1;
  }

  async initialize() {
    try {
      const data = await fs.readFile(this.WEIGHTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      for (const [agentId, weight] of Object.entries(parsed)) {
        this.connectionWeights.set(agentId, weight);
      }
      logger.info(
        `🧠 NeuralRouter: Loaded ${this.connectionWeights.size} synaptic weights from disk.`,
      );
    } catch {
      logger.info(`🧠 NeuralRouter: Initializing baseline synaptic weights.`);
      // Seed base weights using the existing static router
      for (const entry of CAPABILITY_TABLE) {
        if (entry.agent && entry.agent.id) {
          this.connectionWeights.set(entry.agent.id, this.BASE_WEIGHT);
        }
      }
      await this._saveWeights();
    }
  }

  /**
   * Replaces `capabilityRouter.dispatch`.
   * Selects the agent using a combination of LLM semantic relevance and historical neural weight.
   * @param {string} query
   * @param {object} context
   */
  async route(query, context = {}) {
    logger.info(
      `🧠 NeuralRouter: Calculating pathway vectors for query: "${query.substring(0, 50)}..."`,
    );

    // 1. Get Top 5 Candidates via LLM Semantic Mapping
    const prompt = `You are the Biomimetic Neural Net router.
        Given the query: "${query}"
        
        Identify the top 3 Agent IDs from the Inso Code Swarm best suited for this task.
        Output ONLY a JSON array of string IDs (e.g. ["agent_sre_001", "agent_finops_001"]).
        Do not include markdown or text.`;

    let candidateIds = [];
    try {
      const raw = await GeminiAiService.generateContent(prompt);
      const cleaned = raw
        .replace(/^```json?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      candidateIds = JSON.parse(cleaned);
    } catch (e) {
      logger.warn(
        `NeuralRouter Semantic Mapping failed: ${e.message}. Falling back to default router.`,
      );
      return capabilityRouter.dispatch(query, context);
    }

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return capabilityRouter.dispatch(query, context);
    }

    // 2. Multiply Semantic Choice by Genetic Weight
    let bestAgent = null;
    let highestActivation = -1;

    for (const entry of CAPABILITY_TABLE) {
      if (entry.agent && candidateIds.includes(entry.agent.id)) {
        const weight =
          this.connectionWeights.get(entry.agent.id) || this.BASE_WEIGHT;
        // Add a small randomization factor for exploration vs exploitation (Epsilon-Greedy)
        const explorationFactor = Math.random() * 0.2;
        const activation = weight + explorationFactor;

        logger.debug(
          `🧠 Pathway [${entry.agent.id}]: Weight=${weight.toFixed(2)}, Activation=${activation.toFixed(2)}`,
        );

        if (activation > highestActivation) {
          highestActivation = activation;
          bestAgent = entry.agent;
        }
      }
    }

    if (!bestAgent) {
      return capabilityRouter.dispatch(query, context);
    }

    logger.info(
      `🎯 NeuralRouter selected [${bestAgent.id}] with Synaptic Activation: ${highestActivation.toFixed(2)}`,
    );

    // Tag context so we can learn from it later
    context._neuralPathway = bestAgent.id;

    return bestAgent._invoke(query, context);
  }

  /**
   * Backpropagation loop. Called after a Sprint completes.
   * @param {string} agentId
   * @param {number} sprintScore (0 to 100)
   */
  async backpropagate(agentId, sprintScore) {
    if (!agentId || sprintScore === undefined) return;

    const currentWeight =
      this.connectionWeights.get(agentId) || this.BASE_WEIGHT;

    // Normalize score to -1.0 to 1.0 (50 is neutral)
    const normalizedScore = (sprintScore - 50) / 50;

    // Delta = LearningRate * NormalizedScore
    const delta = this.LEARNING_RATE * normalizedScore;

    // Apply activation bounds (0.1 to 3.0)
    let newWeight = Math.max(0.1, Math.min(3.0, currentWeight + delta));

    this.connectionWeights.set(agentId, newWeight);

    logger.info(
      `📈 NeuralRouter Backprop: [${agentId}] SprintScore=${sprintScore} -> Weight adjusted ${currentWeight.toFixed(2)} to ${newWeight.toFixed(2)}`,
    );

    await this._saveWeights();
  }

  async _saveWeights() {
    try {
      await fs.mkdir(path.dirname(this.WEIGHTS_FILE), { recursive: true });
      const obj = Object.fromEntries(this.connectionWeights);
      await fs.writeFile(this.WEIGHTS_FILE, JSON.stringify(obj, null, 2));
    } catch (e) {
      logger.error(`Failed to save neural weights: ${e.message}`);
    }
  }
}

export const neuralRouterService = new NeuralRouterService();
