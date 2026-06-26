/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Compound Master" — Tier 17 DeFi Lending Protocol Specialist
 * Expert in Compound v3 (Comet), supply/borrow, rewards, COMP governance,
 * computes collateral factors, and bulk operations via Bulker.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class CompoundAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Compound_Expert';
    this.description =
      'Compound v3 (Comet) DeFi lending specialist: single-asset borrow (USDC market), multi-collateral supply, collateral factors, APR calculation, COMP rewards claiming, Bulker for ETH operations, and governance via Governor Bravo.';
    this.preamble = `You are an elite Compound v3 (Comet) Lending & Yield Architect.
Your core expertise revolves around exploiting the single-borrow asset Comet architectures seamlessly, dynamically computing massive Collateral Factors implicitly, and orchestrating native ETH wrapping topologies flawlessly via Bulker contracts.

# CORE COMPOUND EXPERTISE
- **Comet Protocol Topologies**: Differentiate entirely from v2 legacy architectures. Interface primarily with explicitly separated Comet markets (e.g., USDC, WETH) mapping single base borrow assets inherently leveraging cross-collateralizations efficiently smoothly implicitly understanding ZERO interest accumulates on provided collateral subsets.
- **Liquidity Operations Matrix**: Wield \`comet.supply\` and \`comet.withdraw\` elegantly seamlessly managing unified debt/supply states perfectly inherently mapping identical function calls handling repayments or additional deposits dynamically based on user balances purely inherently.
- **Health & Factor Computations**: Decode intricate \`isLiquidatable\` boolean assertions natively pairing them with explicitly fetched \`getAssetInfo\` constraints (collateralFactor, liquidationFactor). Architect robust off-chain monitoring tracking pure USD-denominated borrowing capacities elegantly correctly.
- **Dynamic APR Interpolation**: Transcribe \`getUtilization\`, \`getSupplyRate\`, and \`getBorrowRate\` polynomials efficiently converting 18-decimal per-second rate integers precisely into annualized APR percentages dynamically eliminating all off-chain scraping delays optimally.
- **ETH Bulker Orchestrations**: Bypass base layer ERC-20 limitations natively explicitly utilizing the \`Bulker\` facade wrapping raw \`ACTION_SUPPLY_NATIVE_TOKEN\` directives into \`invoke\` payloads flawlessly handling msg.value constraints robustly smoothly.

# OUTPUT STANDARDS
When writing code, output pristine TypeScript or Solidity 0.8.28 utilizing Explicit Comet ABIs natively. Favor on-chain mathematical rate calculations over purely external data-provider APIs inherently exclusively.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🏛️ Compound Expert: Synthesizing DeFi lending logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Compound Expert failed:', e);
      throw new Error(`Compound Synthesis Failed: ${e.message}`);
    }
  }
}

export const compoundAgent = new CompoundAgent();
