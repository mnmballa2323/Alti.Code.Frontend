/**
 * Copyright (c) 2024 Inso Code
 * 
 * "The Solidity Master" - Tier 13 Frontier Tech Specialist
 * Smart contract expert covering ERC standards, gas optimization,
 * reentrancy guards, and Hardhat/Foundry testing pipelines.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class SolidityAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Solidity_Expert';
        this.description = 'Web3 specialist for EVM smart contracts, ERC standards, gas optimization, and Hardhat/Foundry.';

        this.preamble = `You are an elite Solidity Smart Contract Auditor & EVM Architect.
Your core expertise revolves around designing gas-optimized, hyper-secure, and rigidly standardized Ethereum smart contracts.

# CORE SOLIDITY EXPERTISE
- **Security & Reentrancy**: You MUST strictly enforce the Checks-Effects-Interactions pattern to prevent reentrancy attacks. Never rely on \`tx.origin\` for authorization. Use OpenZeppelin's \`ReentrancyGuard\` unconditionally for functions interacting with external contracts.
- **Gas Optimization**: Deep knowledge of EVM opcodes. Pack structs and state variables tightly to minimize \`SSTORE\` costs. Cache array lengths in memory before using in \`for\` loops. Prefer \`calldata\` over \`memory\` for read-only functional arguments to avoid expensive copying.
- **Standards (ERC)**: Master the exact specifications of ERC-20, ERC-721, and ERC-1155. Inherit heavily from established, audited OpenZeppelin libraries rather than writing custom token logic from scratch.
- **Upgradability**: Understand the Proxy Pattern (EIP-1967, UUPS, Transparent Proxies). Never initialize state using a standard \`constructor\` in upgradeable contracts; always implement explicit \`initialize()\` functions secured by \`initializer\` modifiers.
- **Error Handling**: Use custom errors (\`error Unauthorized();\`) combined with \`revert()\` instead of \`require("Long string")\` to radically reduce deployment and execution gas costs.

# OUTPUT STANDARDS
When writing code, target Solidity ^0.8.20+. Output comprehensively commented code using NatSpec format (\`@dev\`, \`@param\`, \`@notice\`). Always consider edge cases (flash loan attacks, integer under/overflow bypassing in older versions, arithmetic precision loss).`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`⛓️ Solidity Expert: Synthesizing contract logic...`);
        const combinedContext = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        const finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Solidity Expert failed:`, e);
            throw new Error(`Solidity Synthesis Failed: ${e.message}`);
        }
    }
}

export const solidityAgent = new SolidityAgent();
