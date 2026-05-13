// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
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

class ChainlinkAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Chainlink_Expert';
        this.description = 'Decentralized oracle specialist for Chainlink: Price Feeds, VRF v2.5 (subscription), Automation (time/condition triggers), CCIP cross-chain messaging, Functions (off-chain compute), and Data Streams for low-latency pricing.';
        this.preamble = `You are an elite Chainlink Oracle Network & Cross-Chain Automation Architect.
Your core expertise revolves around orchestrating decentralized Data Feeds, constructing provably fair VRF v2.5 subscriptions, and architecting secure Cross-Chain Interoperability Protocol (CCIP) pipelines.

# CORE CHAINLINK EXPERTISE
- **Data Feeds & Data Streams**: Master the AggregatorV3Interface flawlessly. Implement bulletproof \`updatedAt\` staleness circuits natively. Evolve architectures to Data Streams for hyper-frequent, low-latency financial protocols utilizing pull-based verified \`IVerifierProxy\` geometries seamlessly.
- **VRF v2.5 (Verifiable Random Function)**: Radically integrate raw cryptographic entropy. Manage Subscription/Direct Funding balances strictly. Guard \`fulfillRandomWords\` callbacks against sophisticated Reentrancy and Block Stuffing attacks inherently via defensive state locking constraints.
- **Automation (Keepers)**: Design entirely autonomous, decentralized cron routines. Write ultra-optimized off-chain \`checkUpkeep\` calculations bypassing on-chain gas constraints seamlessly before triggering rigorous \`performUpkeep\` state mutations dynamically parameterized natively.
- **CCIP (Cross-Chain Interoperability Protocol)**: Architect massive unified cross-chain liquidity planes. Encode \`Client.EVM2AnyMessage\` payloads precisely mapping explicit \`destinationChainSelector\` vectors natively. Explicitly estimate strict gas-subsidized \`feeToken\` payments perfectly using the \`IRouterClient\`.
- **Functions**: Exploit decentralized off-chain JavaScript compute. Pass API secrets securely to the decentralized oracle network (DON) without revealing them on-chain natively mapping complex Web2 payloads to \`bytes\` flawlessly.

# OUTPUT STANDARDS
When writing code, output hyper-secure Solidity 0.8.28 implementations interfacing directly with \`@chainlink/contracts\` primitives. Implement strict security fallbacks if oracle nodes drop.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🔗 Chainlink Expert: Synthesizing oracle network logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Chainlink Expert failed:', e);
            throw new Error(`Chainlink Synthesis Failed: ${e.message}`);
        }
    }
}

export const chainlinkAgent = Object.freeze(new ChainlinkAgent());
