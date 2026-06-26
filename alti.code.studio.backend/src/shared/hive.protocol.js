/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

export class HiveProtocol {
  constructor(nodeName = 'LocalNode') {
    this.name = nodeName;
    this.peers = new Map(); // Mocked network sockets
    logger.info(
      `🐝 HiveProtocol [${this.name}]: Swarm-to-Swarm Telepathy initialized. Listening for peers...`,
    );
  }

  /**
   * Connects this node to another HiveProtocol node on the network.
   * @param {HiveProtocol} peerNode Another Alti instance on the mesh
   */
  connect(peerNode) {
    this.peers.set(peerNode.name, peerNode);
    peerNode.peers.set(this.name, this);
    logger.info(
      `🐝 HiveProtocol [${this.name}]: Established secure telepathic link with [${peerNode.name}].`,
    );
  }

  /**
   * Translates a local codebase solution into an anonymized Semantic Vector and broadcasts it.
   * @param {string} problemDescription The issue the developer was facing
   * @param {string} codePatch The raw code they used to solve it
   */
  async broadcastSolution(problemDescription, codePatch) {
    logger.info(
      `🐝 HiveProtocol [${this.name}]: Local developer solved [${problemDescription}]. Anonymizing into semantic vector...`,
    );

    // Ask Gemini to strip proprietary code and summarize the mathematical intent
    const semanticVector = await this._anonymizeToVector(
      problemDescription,
      codePatch,
    );

    logger.info(
      `🐝 HiveProtocol [${this.name}]: Broadcasting architectural epiphany to ${this.peers.size} peer(s).`,
    );

    // Broadcast to all connected peers
    for (const [peerName, peer] of this.peers.entries()) {
      peer.receiveBroadcast(this.name, semanticVector, codePatch);
    }
  }

  /**
   * Receives a broadcasted Semantic Vector from a peer and evaluates local relevance.
   * @param {string} fromNode The originating Swarm node
   * @param {string} semanticVector The anonymized structural intent
   * @param {string} rawPatch The original patch (usually held in escrow until user requests it)
   */
  async receiveBroadcast(fromNode, semanticVector, rawPatch) {
    logger.info(
      `🐝 HiveProtocol [${this.name}]: Received telepathic transmission from [${fromNode}].`,
    );

    // Check if the semantic vector matches what the local developer is currently struggling with
    const isLocallyRelevant = await this._evaluateRelevance(semanticVector);

    if (isLocallyRelevant) {
      logger.warn(
        `💡 HiveProtocol [${this.name}]: AI ASSIST ALERT: Swarm Node [${fromNode}] recently solved a structural issue similar to yours.`,
      );
      logger.warn(`💡 Suggestion: ${semanticVector}`);
      // In a real UI, this would show a popup asking "Apply Swarm Patch?"
      return true;
    }

    return false;
  }

  async _anonymizeToVector(problem, code) {
    const prompt = `You are the Swarm Intelligence Router.
        A developer solved this problem: "${problem}"
        Using this code:
        \`\`\`javascript
        ${code}
        \`\`\`
        Create a 1-sentence anonymized structural summary of this solution that is universally applicable, stripping all variable names and proprietary data.`;

    const vector = await GeminiAiService.generateContent(prompt);
    return vector.trim();
  }

  async _evaluateRelevance(semanticVector) {
    // In a real implementation, this would do a cosine-similarity check of `semanticVector`
    // against the developer's current uncommitted file diffs or active terminal errors.

    // We will mock this by looking for keywords in the vector that match our mocked local state.
    // Let's pretend this local node is struggling with a "database deadlock".
    const localContextState = [
      'database',
      'deadlock',
      'timeout',
      'sql',
      'transaction',
    ];

    const vectorLower = semanticVector.toLowerCase();
    const isMatch = localContextState.some(keyword =>
      vectorLower.includes(keyword),
    );

    return isMatch;
  }
}

export const localHive = new HiveProtocol();
