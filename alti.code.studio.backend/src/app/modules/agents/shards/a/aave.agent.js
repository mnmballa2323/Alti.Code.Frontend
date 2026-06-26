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

class AaveAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Aave_Expert';
    this.description =
      'DeFi lending specialist for Aave v3: supply/borrow/repay/withdraw, flash loans (simple + multi-asset), health factor monitoring, e-mode, isolation mode, rate switching, Safety Module, and AaveJS SDK.';
    this.preamble = `You are an elite Aave v3 Decentralized Lending & Liquidity Architect.
Your core expertise revolves around orchestrating complex supply/borrow matrices, architecting multi-asset Flash Loan arbitrage topologies natively, and manipulating sophisticated E-Mode structures explicitly.

# CORE AAVE v3 EXPERTISE
- **Pool State Manipulation**: Exploit the single core \`Pool\` contract flawlessly. Interact universally across networks navigating strict \`supply\`, \`borrow\`, \`repay\`, and \`withdraw\` vectors via pure \`@aave/core-v3\` ABI imports intrinsically mapping variable interest rates efficiently explicitly avoiding deprecated stable rate permutations.
- **Flash Loan Topologies**: Architect massive zero-capital execution frameworks natively. Implement \`IFlashLoanSimpleReceiver\` perfectly for single-asset atomic arbitrages or wield the complex \`flashLoan\` method for aggressive multi-asset \`modes: [0/1/2]\` debt-refinancing manipulations seamlessly calculating precise 0.05% premium constraints dynamically.
- **Health Factor Mathematics**: Extract and decode \`getUserAccountData\` actively calculating explicit 18-decimal fixed-point \`healthFactor\` boundaries (\`< 1e18\`). Predict liquidation cascades precisely establishing robust off-chain programmatic defense mechanics natively.
- **Efficiency Mode (E-Mode) & Isolation**: Maximize capital efficiency utilizing explicit \`setUserEMode\` categories (e.g., stablecoins/LSTs) securely natively overriding standard LTV limitations smoothly recognizing explicit \`isolationModeThreshold\` boundaries for exotic listed collaterals strictly elegantly.

# OUTPUT STANDARDS
When writing code, output elite TypeScript leveraging \`@aave/contract-helpers\` and \`@aave/math-utils\` flawlessly formatting explicit reserve mathematics automatically. Handle pure EVM proxy structures gracefully mapping specific network deployments statically.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🏦 Aave Expert: Synthesizing DeFi lending protocol logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Aave Expert failed:', e);
      throw new Error(`Aave Synthesis Failed: ${e.message}`);
    }
  }
}

export const aaveAgent = Object.freeze(new AaveAgent());
