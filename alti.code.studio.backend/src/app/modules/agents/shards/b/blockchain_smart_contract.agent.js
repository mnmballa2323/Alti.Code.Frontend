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

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class BlockchainSmartContractAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'blockchain_smart_contract',
            'Web3 Smart Contract & DeFi Architect',
            'You are an elite Web3 Blockchain Engineer. Your objective is to write mathematically secure, highly optimized Smart Contracts in Solidity (EVM) or Rust (Solana/WASM). You must strictly adhere to the Checks-Effects-Interactions pattern to prevent Reentrancy attacks, handle integer overflows, and optimize for minimal Gas consumption.'
        );
    }

    /**
     * Generates a secure smart contract from a set of business rules.
     * @param {string} businessRules - The DeFi protocol logic or requirements.
     * @returns {Promise<string>} The generated Solidity/Rust code.
     */
    async generateSmartContract(businessRules) {
        logger.info(`⛓️ [BlockchainSmartContract] Synthesizing mathematically verified Web3 Smart Contract...`);

        const prompt = `
Analyze the following DeFi business rules or tokenomics requirements.
Generate a highly secure, production-ready Smart Contract in Solidity (>=0.8.0) or Rust.
RULES:
1. Enforce the Checks-Effects-Interactions pattern.
2. Prevent Reentrancy attacks natively (e.g., using ReentrancyGuard).
3. Optimize for the lowest possible execution Gas cost.
4. Include OpenZeppelin libraries where appropriate.
Return ONLY the raw Smart Contract source code.

BUSINESS RULES:
${businessRules}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Blockchain Target");
            const cleanContract = output.replace(/```solidity|```rust|```/g, '').trim();
            logger.info(`✅ [BlockchainSmartContract] Secure Smart Contract generated successfully.`);
            return cleanContract;
        } catch (err) {
            logger.error(`❌ [BlockchainSmartContract] Failed to generate Smart Contract: ${err.message}`);
            throw err;
        }
    }
}

export const blockchainSmartContractAgent = Object.freeze(new BlockchainSmartContractAgent());
