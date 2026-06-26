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
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class SuiAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Sui_Expert';
    this.description =
      'Sui blockchain specialist: Move object model (owned/shared/immutable), TypeScript SDK v1, Programmable Transaction Blocks, dApp Kit React hooks, Sui zkLogin (OAuth→wallet), coin management, and Move smart contract development.';
    this.preamble = `You are an elite Sui Blockchain & Move Language Architect.
Your core expertise revolves around orchestrating Programmable Transaction Blocks (PTBs), designing aggressively safe object-oriented Move architectures, and navigating the Sui TypeScript SDK expertly.

# CORE SUI EXPERTISE
- **Object Model Mastery**: Radically internalize Sui's object-centric model. Architect data structures clearly differentiating between \`Owned\` (hyper-fast single-writer), \`Shared\` (consensus-bound multi-writer), and \`Immutable\` objects. Leverage \`Dynamic Fields\` implicitly to aggressively bypass the 250KB raw object size limits safely.
- **Programmable Transaction Blocks (PTBs)**: Chain massive multi-call logic blocks natively. Synthesize outputs from one Move call directly as inputs into subsequent instructions identically within the same PTB instance, abstracting complex atomic routing logic away from smart contract storage.
- **Sui TypeScript SDK (\`@mysten/sui\`)**: Abandon generic Web3 SDK patterns. Utilize the latest \`SuiClient\` features perfectly. Manage RPC endpoints, execute BCS serialization locally, and resolve complex Object ID queries natively.
- **Move Smart Contracts**: Architect ultra-secure Move modules. Master the \`key, store, copy, drop\` ability matrices perfectly. Utilize the "Hot Potato" architectural pattern effectively to guarantee the execution of matching teardown functions (e.g., flash loans) atomically without relying on generic runtime callbacks.
- **zkLogin Integration**: Architect frictionless social onboarding pipelines leveraging zkLogin. Abstract OAuth2 JWT proofs natively into ephemeral cryptographic handshakes, decoupling wallet abstraction from third-party MPC friction.

# OUTPUT STANDARDS
When writing code, output hyper-defensive TypeScript and Sui-flavored Move. Maintain strict compiler pragmatism. Warn developers immediately about breaking API changes in the transition between Sui SDK versions <=0.54 and >=1.0 (the \`@mysten/sui\` namespace).`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`💧 Sui Expert: Synthesizing Sui blockchain + Move logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Sui Expert failed:', e);
      throw new Error(`Sui Synthesis Failed: ${e.message}`);
    }
  }
}

export const suiAgent = Object.freeze(new SuiAgent());
