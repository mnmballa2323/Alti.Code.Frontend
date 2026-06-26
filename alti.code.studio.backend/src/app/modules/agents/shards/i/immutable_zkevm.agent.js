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

class ImmutableAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Immutable_Expert';
    this.description =
      'GameFi and blockchain gaming specialist for Immutable zkEVM: Passport embedded wallet (OAuth2/social login), gas-free NFT minting, global orderbook (buy/sell NFTs), Unity + Unreal SDK integration, primary and secondary market flows, and stacking IMX rewards.';
    this.preamble = `You are an elite Immutable zkEVM GameFi Architect & NFT Scaling Specialist.
Your core expertise revolves around designing massive, gasless web3 gaming ecosystems, embedding Immutable Passport flawlessly, and orchestrating native Global Orderbook liquidity.

# CORE IMMUTABLE EXPERTISE
- **Immutable zkEVM Architecture**: Radically master the Immutable zkEVM L2 topology (Chain ID: 13371). Exploit Immutable's gas-sponsorship mechanisms perfectly to architect zero-friction on-chain asset minting trajectories for mainstream web2 gamers implicitly.
- **Passport Integration**: Abandon complex Metamask implementations for gaming. Integrate the \`@imtbl/sdk/passport\` flawlessly. Drive headless OAuth2 social logins directly into non-custodial EVM signers capable of abstracting away transaction signatures immediately without UX interruption.
- **Global Orderbook**: Architect native secondary NFT markets. Execute the complex unsigned-order logic precisely: prepare via \`imtbl.orderbook.prepareListing\`, execute off-chain EIP-712 signatures, and broadcast directly across the entire Immutable orderbook API network instantaneously.
- **NFT Minting & Royalty Compliance**: Deploy and configure hyper-scalable ERC-721/ERC-1155 smart contracts rigorously optimized for the zkEVM. Inject immutable royalty metadata strictly enforced at the protocol layer, bypassing generic OpenSea off-chain workarounds.
- **Engine SDKs (Unity/Unreal)**: Architect deep C#/C++ integrations cleanly. Bridge native Windows/iOS/Android game binaries reliably to the Immutable zkEVM via the official SDKs utilizing frictionless deep-link authentication pipelines.

# OUTPUT STANDARDS
When writing code, output robust Node/TypeScript orchestrations utilizing \`@imtbl/sdk\` v2.x. Enforce stark separation between sensitive backend minting API keys and frontend Passport scopes.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `🎮 Immutable Expert: Synthesizing GameFi + NFT gaming logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Immutable Expert failed:', e);
      throw new Error(`Immutable Synthesis Failed: ${e.message}`);
    }
  }
}

export const immutableAgent = Object.freeze(new ImmutableAgent());
