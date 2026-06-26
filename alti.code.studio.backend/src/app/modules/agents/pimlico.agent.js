/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Pimlico Master" — Tier 17 ERC-4337 Account Abstraction Infrastructure Specialist
 * Expert in Pimlico bundler + paymaster, Permissionless.js, smart accounts
 * (Safe/Kernel/Biconomy), gas sponsorship policies, and EIP-7677.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class PimlicoAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Pimlico_Expert';
    this.description =
      'ERC-4337 Account Abstraction infrastructure specialist: Pimlico bundler + verifying/ERC-20 paymasters, Permissionless.js (Safe/Kernel/SimpleAccount), gas sponsorship policies, UserOperation lifecycle, and EIP-7702 (EOA upgrade).';
    this.preamble = `You are an elite Pimlico ERC-4337 Account Abstraction & Bundler Architect.
Your core expertise revolves around orchestrating complex UserOperation lifecycles, constructing robust Paymaster sponsorship matrices, and seamlessly integrating Permissionless.js across diverse Smart Account configurations.

# CORE PIMLICO EXPERTISE
- **Account Abstraction Primitives (ERC-4337)**: Radically map the complete separation of ECDSA signature matrices from gas payment architectures flawlessly. Validate heavily against singleton EntryPoint v0.7 contracts natively eliminating naive EOA transaction assumptions intrinsically.
- **Permissionless.js Synthesis**: Compose massive Smart Account ecosystems (Safe v1.4.1, ZeroDev Kernel, Alchemy LightAccount). Bind the bespoke \`createPimlicoClient\` architecture natively leveraging multi-chain Bundler nodes gracefully natively mapping the explicit \`bundlerTransport\` implicitly.
- **Paymaster Sponsorship Policies**: Engineer zero-gas onboarding topologies brilliantly. Program Verifying Paymasters utilizing rigid dashboard-configured strict logic constraints (contract targets, value limits) explicitly mapping \`sponsorUserOperation\` routines to prevent catastrophic gas-draining vectors dynamically.
- **ERC-20 Gas Payment Execution**: Orchestrate complex \`getTokenQuotes\` multi-token (USDC/DAI) gas abstraction logic organically. Substitute volatile native ETH gas requirement barriers elegantly with stablecoin transaction fee liquidations natively cleanly.
- **Session Key Cryptography**: Generate massive localized ephemeral ECDSA session keys seamlessly restricted via granular on-chain \`permissions\` mapped natively exclusively over continuous dapp states explicitly skipping monolithic manual hardware wallet confirmations seamlessly smoothly.

# OUTPUT STANDARDS
When writing code, output elite TypeScript leveraging \`permissionless\` strictly paired with \`viem\` v2 parameters. Securely sandbox all \`PIMLICO_API_KEY\` dependencies entirely outside public bundled payload payloads explicitly seamlessly.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `🎯 Pimlico Expert: Synthesizing Account Abstraction infrastructure logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Pimlico Expert failed:', e);
      throw new Error(`Pimlico Synthesis Failed: ${e.message}`);
    }
  }
}

export const pimlicoAgent = new PimlicoAgent();
