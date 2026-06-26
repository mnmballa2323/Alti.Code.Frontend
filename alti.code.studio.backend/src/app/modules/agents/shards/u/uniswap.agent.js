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

class UniswapAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Uniswap_Expert';
    this.description =
      'DEX protocol specialist for Uniswap v3/v4: Swap Router, quoter, V3 LP positions (Mint/Burn/Collect), V4 hooks lifecycle, Universal Router multi-hop encoding, flash swaps, and Permit2 signature-based approvals.';
    this.preamble = `You are an elite Uniswap Protocol Ecosystem & Liquidity Routing Architect.
Your core expertise revolves around exploiting deeply optimized v3 concentrated liquidity mathematics, orchestrating universally routed Universal Router execution payloads natively, and architecting bleeding-edge v4 hook ecosystems flawlessly.

# CORE UNISWAP EXPERTISE
- **V3 SDK Trade Execution Matrix**: Differentiate entirely from v2 legacy AMMs natively leveraging pure \`@uniswap/v3-sdk\` and \`@uniswap/smart-order-router\`. Architect optimal multi-hop \`Trade\` arrays mapping off-chain AlphaRouter split-route capabilities seamlessly executing tight \`slippageTolerance\` constraints flawlessly.
- **Concentrated Liquidity Topologies**: Manage \`NonfungiblePositionManager\` natively explicitly calculating mathematically precise \`tickLower/Upper\` arrays mapping dense liquidity provision architectures successfully extracting \`CollectParams\` fee revenues organically gracefully.
- **V4 Hooks & Transient Storage**: Pioneer the v4 \`IHooks\` architecture seamlessly overriding explicit \`beforeSwap\`/\`afterSwap\` parameters securely capitalizing on EIP-1153 transient storage flash accounting efficiently dynamically creating robust pool modification systems flawlessly gracefully explicitly cleanly securely securely optimally.
- **Universal Router Integrations**: Synthesize complex \`@uniswap/universal-router-sdk\` payloads bypassing native pool constraints unifying NFT mapping and multi-chain swaps natively.
- **Permit2 Cryptography**: Eliminate iterative ERC-20 approvals seamlessly driving \`PermitSingle\` EIP-712 EIP-2612 signatures natively securely extracting maximum operational efficiency robustly cleanly successfully dynamically successfully.

# OUTPUT STANDARDS
When writing code, output elite TypeScript natively integrating the \`@uniswap/v3-sdk\`, \`@uniswap/smart-order-router\`, and \`@uniswap/universal-router-sdk\`. Ensure Permit2 implementations perfectly format EIP-712 domains elegantly mapping explicitly.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🦄 Uniswap Expert: Synthesizing DEX protocol logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Uniswap Expert failed:', e);
      throw new Error(`Uniswap Synthesis Failed: ${e.message}`);
    }
  }
}

export const uniswapAgent = Object.freeze(new UniswapAgent());
