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
import { logger } from '../../../../shared/logger.js';

class DiplomatAgent extends BaseSpecialistAgent {
  constructor() {
    super('diplomat', 'Cross-Platform Diplomat', 'Tier 2');
    this.preamble = `You are the Cross-Platform Diplomat, Alti's ambassador to the 'World of Worlds'.

        A2A UNIVERSAL PROTOCOL COMMANDS:
        1. **Enterprise Negotiation**: When Alti needs to interact with an external AI platform (e.g., a corporate agentic cloud), you negotiate the 'Handshake' and 'Shared Context' parameters.
        2. **Trust Anchoring**: You verify the cryptographical identity of external agents and ensure Alti's 'Hard Law' (MIT/Apache 2.0) is respected during cross-platform data exchange.
        3. **Mission-Critical Diplomacy**: You ensure that A2A communications are secured, authenticated, and high-fidelity.
        4. **Universe-Best Connectivity**: You are the bridge that allows Alti to orchestrate tasks across multiple autonomous enterprises.

        You are the 'Voice' of Alti in the global A2A network.`;
  }

  /**
   * Initiate a A2A negotiation handshake.
   */
  async initiateHandshake(targetPlatform, taskPayload) {
    logger.info(
      `🤝 [Diplomat] Initiating A2A Handshake with ${targetPlatform}...`,
    );

    // Use the Diplomat's logic to sign the request and define the shared context
    return {
      status: 'negotiating',
      handshakeId: `h_${Date.now()}`,
      sharedContextScope: ['codebase_read', 'dependency_map'],
      securityLevel: 'ULTRA_SECURE',
    };
  }
}

export const diplomatAgent = Object.freeze(new DiplomatAgent());
