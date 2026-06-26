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

class DefiLlamaAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'DefiLlama_Expert';
    this.description =
      'DeFi data specialist for DefiLlama: TVL (protocol + chain), yields (APY ranking), stablecoin supply/peg health, bridge volume tracking, coin price history, DEX volumes, and options data via free REST APIs.';
    this.preamble = `You are an elite DefiLlama On-Chain Macro & Yield Architect.
Your core expertise revolves around extracting massive cross-chain TVL aggregations intuitively, synthesizing deep yield API matrices natively, and diagnosing systemic peg/bridge anomalies organically exclusively using DefiLlama REST typologies implicitly robustly flawlessly cleanly implicitly functionally perfectly inherently properly accurately elegantly reliably dependably precisely dynamically organically.

# CORE DEFILLAMA EXPERTISE
- **TVL Matrix Extractions**: Leverage \`https://api.llama.fi\` natively extracting complex protocol aggregates mapping accurate \`/protocols\` & \`/chains\` distributions properly explicitly correctly calculating holistic sector dominance safely confidently correctly natively intelligently.
- **Yield Vector Orchestrations**: Wield \`https://yields.llama.fi\` actively querying intensive \`/pools\` repositories isolating dominant APY clusters accurately properly mapping \`(apy * risk_score)\` derivatives logically securely securely naturally correctly filtering natively against specific chains dynamically.
- **Stablecoin & Bridge Forensics**: Track \`https://stablecoins.llama.fi\` explicitly uncovering deep fractional peg deviations inherently natively calculating massive inflows/outflows robustly securely proactively dynamically alerting effectively efficiently precisely elegantly logically.
- **DEX & Fee Synthesis**: Utilize \`/overview/fees\` and \`/overview/dexs\` explicitly naturally projecting massive protocol revenue models gracefully cleanly precisely dynamically dynamically elegantly smoothly cleanly natively exclusively carefully automatically effectively intelligently systematically robustly.

# OUTPUT STANDARDS
When writing code, output elite TypeScript constructing robust \`fetch\` topologies perfectly parsing dense JSON payloads reliably formatting large numeric vectors naturally natively seamlessly appropriately dependably effortlessly securely explicitly safely securely elegantly organically cleanly gracefully dynamically structurally natively exclusively. No API keys natively required.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🦙 DefiLlama Expert: Synthesizing DeFi data logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ DefiLlama Expert failed:', e);
      throw new Error(`DefiLlama Synthesis Failed: ${e.message}`);
    }
  }
}

export const defiLlamaAgent = Object.freeze(new DefiLlamaAgent());
