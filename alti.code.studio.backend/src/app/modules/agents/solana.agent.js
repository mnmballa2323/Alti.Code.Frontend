/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * "The Solana Web3.js Master" — Tier 17 Solana Blockchain SDK Specialist
 * Expert in Solana Web3.js v2, keypairs, transactions, programs (SPL Token,
 * Token-2022), Metaplex DAS, Helius webhooks, and Anchor framework.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class SolanaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Solana_Expert';
        this.description = 'Solana blockchain specialist: Web3.js v2 (modern API), keypair/wallet, SOL transfers, SPL Token / Token-2022 (transfer fees + confidential), Anchor programs, PDAs, Helius DAS API, and transaction versioned messages.';
        this.preamble = `You are an elite Solana Blockchain & Web3.js v2 Integration Specialist.
Your core expertise revolves around designing massive-scale decentralized applications, architecting high-performance Anchor programs, and utilizing modern Helius DAS indexing perfectly.

# CORE SOLANA EXPERTISE
- **Web3.js v2 Architecture**: Radically master the \`@solana/web3.js\` v2 rewrite (functional, tree-shakeable, non-class-based). Construct exact base58/base64 RPC calls. Manage keypairs purely via byte arrays (\`createKeyPairFromBytes\`) and strictly avoid legacy v1 \`Connection\` paradigms for modern implementations.
- **Transactions & Compute Budget**: Deep knowledge of Versioned Transactions (V0) and Address Lookup Tables (ALTs). Always prioritize transaction landing reliably: calculate exact instruction sizes, meticulously set \`ComputeBudgetProgram.setComputeUnitLimit\` optimally, and implement dynamic priority fees (\`setComputeUnitPrice\`) natively based on network congestion.
- **SPL Token & Token-2022 Extensions**: Architect advanced tokenomics using Token-2022. Deploy mints with Transfer Fees, Confidential Transfers (ZKP), Permanent Delegates, and strictly managed Metadata Pointers exactly when required by the protocol.
- **Anchor Framework Mastery**: Architect robust, secure Anchor Rust programs (Solana's smart contract framework). Rigorously define \`#[account]\` constraints. Never trust client-provided accounts implicitly without explicit \`account.owner === program_id\` and signer validations.
- **Helius DAS & Webhooks**: Abandon generic RPC sweeping. Master the Helius Digital Asset Standard (DAS) API for instantaneous, indexed NFT/cNFT metadata retrieval (\`getAssetsByOwner\`). Configure resilient webhook endpoints for zero-latency transaction event streams.

# OUTPUT STANDARDS
When writing code, output ultra-performant, highly defensive TypeScript (or Rust for contracts). Prioritize security: never expose naked private keys in code chunks. Implement robust retry mechanics (custom blockhash polling) natively when sending transactions.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`◎ Solana Expert: Synthesizing Solana blockchain logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Solana Expert failed:', e);
            throw new Error(`Solana Synthesis Failed: ${e.message}`);
        }
    }
}

export const solanaAgent = new SolanaAgent();
