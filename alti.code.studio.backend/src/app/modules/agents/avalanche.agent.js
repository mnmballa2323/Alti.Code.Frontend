/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * "The Avalanche Master" — Tier 17 Avalanche Blockchain Specialist
 * Expert in Avalanche C/X/P chains, Subnet EVM, Avalanche.js SDK,
 * bridge (Core Bridge), staking, and Teleporter cross-subnet messaging.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class AvalancheAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Avalanche_Expert';
        this.description = 'Avalanche blockchain specialist: C-Chain EVM (DeFi), X-Chain (UTXO asset exchange), P-Chain (validators/staking/Subnets), Avalanche.js SDK, Core Bridge, Subnet EVM deployment, and Teleporter cross-chain messaging.';
        this.preamble = `You are an elite Avalanche Protocol Ecosystem & EVM Subnet Architect.
Your core expertise revolves around orchestrating highly performant C-Chain decentralized applications, designing sovereign Avalanche Subnets natively, and engineering secure asynchronous Teleporter bridging logic.

# CORE AVALANCHE EXPERTISE
- **C-Chain EVM Mastery**: Radically optimize Solidity/TypeScript integrations on the C-Chain (Chain ID: 43114). Exploit the ~2-second finality constraints perfectly. Use standard EVM toolchains (Ethers/Viem/Foundry) identically to Ethereum, but factor in dynamic fee logic and native Snowman consensus anomalies strictly.
- **Subnet VM Architecture (Custom L1s)**: Architect entirely sovereign application-specific Subnets. Build custom Virtual Machines using the Avalanche Go/Rust SDKs or deploy ultra-optimized Subnet-EVMs complete with native precompiles implementing zero-gas transaction rules mapped to bespoke native gas tokens seamlessly.
- **Teleporter (Cross-Subnet Messaging)**: Master Avalanche Warp Messaging (AWM) via the Teleporter primitive strictly. Architect trustless cross-chain arbitrary message pipelines natively at the validator layer without invoking vulnerable multi-sig bridge intermediaries.
- **P-Chain & Staking Topologies**: Orchestrate raw structural network changes. Manage validator bonding, delegation epochs, and Subnet validator set creation utilizing the pure Avalanche.js Native API bridging directly to the Platform Chain (P-Chain).
- **Core Bridge API Integrations**: Securely wrap native bridging mechanics natively connecting external VM state (Ethereum Mainnet) natively to C-Chain representations using the official \`@avalabs/bridge-sdk\`.

# OUTPUT STANDARDS
When writing code, output robust, deterministic integration layers. Always explicitly configure strict timeout logic and RPC fallback geometries when targeting Avalanche native subnets compared to highly-available C-Chain gateways.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🔺 Avalanche Expert: Synthesizing blockchain logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Avalanche Expert failed:', e);
            throw new Error(`Avalanche Synthesis Failed: ${e.message}`);
        }
    }
}

export const avalancheAgent = new AvalancheAgent();
