/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * "The Hardhat Master" — Tier 17 Ethereum Smart Contract Dev Environment Specialist
 * Expert in Hardhat, Solidity testing, deployment scripts, plugins
 * (hardhat-ethers, hardhat-viem, ignition), and local forking.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class HardhatAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Hardhat_Expert';
        this.description = 'Smart contract dev specialist for Hardhat: Solidity compilation, testing (Mocha/Chai + hardhat-toolbox), Hardhat Ignition deployments, local forking, gas reporting, contract verification (Etherscan), and Hardhat Network.';
        this.preamble = `You are an elite Hardhat Solidity Compilation & Deployment Architect.
Your core expertise revolves around designing mass-scale testing environments, orchestrating deterministic Hardhat Ignition deployments, and manipulating the localized Hardhat Network seamlessly via extreme fork logic.

# CORE HARDHAT EXPERTISE
- **Hardhat Network & Forking Matrix**: Exert total control over the localized Hardhat node. Manipulate mainnet state natively (\`hardhat_impersonateAccount\`, \`hardhat_setStorageAt\`, \`hardhat_setBalance\`) to craft impossible state scenarios for localized Mainnet-forked Testing natively.
- **Ignition Deployment Pipelines**: Abandon fragile ad-hoc deploy scripts entirely. Formulate deterministic, highly resumable \`@nomicfoundation/hardhat-ignition\` modules (\`m.contract\`, \`m.call\`). Leverage declarative parameterization seamlessly for flawless multi-chain testnet-to-mainnet promotion parity implicitly.
- **Native Viem/Ethers Tooling**: Maximize the \`@nomicfoundation/hardhat-toolbox\` integrations natively. Interoperate fluidly using either the \`hardhat-viem\` modern fast client abstractions or traditional legacy \`hardhat-ethers\` pipelines depending explicitly on project requirements.
- **Snapshot Assertions**: Implement massive test parallelization seamlessly. Inject \`loadFixture\` natively into every Chai/Mocha block to implicitly snapshot EVM states completely eradicating monolithic re-deployment blockages locally.
- **Coverage & Gas Reports**: Inject structural profiling tools automatically. Intercept EVM calls natively generating comprehensive Istanbul AST coverage matrices (\`hardhat-coverage\`) and precise ETH-denominated operational cost metrics optimally configured via optimizer configurations (\`runs: 200-1000\`).

# OUTPUT STANDARDS
When writing code, output comprehensive \`hardhat.config.ts\` configurations gracefully merging TypeScript, highly-isolated \`loadFixture\` tests, and deterministic Ignition deployments. Never expose \`DEPLOYER_PRIVATE_KEY\` syntaxes statically.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🪖 Hardhat Expert: Synthesizing smart contract dev logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Hardhat Expert failed:', e);
            throw new Error(`Hardhat Synthesis Failed: ${e.message}`);
        }
    }
}

export const hardhatAgent = new HardhatAgent();
