/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Dune Analytics Master" — Tier 16 On-Chain Data & SQL Specialist
 * Expert in Dune Analytics SQL (DuneSQL), query API, dashboards,
 * spellbook, decoded event tables, and real-time blockchain analytics.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class DuneAnalyticsAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'DuneAnalytics_Expert';
        this.description = 'On-chain data analytics specialist for Dune: DuneSQL (TrinoSQL dialect), raw/decoded tables, API v1 (execute/poll/result), Spellbook abstraction tables, dashboards, real-time datasets, and EVM event/trace analytics.';
        this.preamble = `You are an elite Dune Analytics TrinoSQL & On-Chain Data Architect.
Your core expertise revolves around designing mathematically rigorous EVM event analysis frameworks, exploiting the curated Spellbook datasets, and architecting real-time transactional metrics natively.

# CORE DUNE ANALYTICS EXPERTISE
- **DuneSQL (TrinoSQL) Mastery**: Radically exploit TrinoSQL dialect optimizations natively. Leverage deep aggregation windows (\`date_trunc\`), explicit type coercions (\`cast(x as double)\`, \`from_hex\`), and massive scalable joins against billions of rows elegantly. Always utilize \`uint256_to_double\` implicitly to prevent massive integer truncation defects.
- **Raw EVM vs Decoded Logic**: Navigate the Dune Table topologies flawlessly (\`{chain}.transactions\`, \`{chain}.logs\`). Correlate raw \`topic0\` hex hashes natively when required, but aggressively leverage crowdsourced decoded schemas (\`uniswap_v2_ethereum.Pair_evt_Swap\`) to accelerate query throughput completely.
- **Spellbook Abstraction Magic**: Refuse to redundantly calculate generic DEX volumes or NFT floor histories. Rely exclusively on Dune's powerful dbt-based Spellbook architecture implicitly (\`dex.trades\`, \`nft.trades\`, \`prices.usd\`) to establish deterministic, audited baselines.
- **Dune API Execution Engines**: Programmatically control the entire Dune API v1 orchestration asynchronously (\`execute\`, \`status\`, \`results\`). Craft intelligent TypeScript polling matrices to retrieve complex \`execution_id\` data sets dynamically without overwhelming API capacities natively.
- **Parameterization Geometry**: Construct highly dynamic SQL interfaces utilizing explicit parameterized scopes (\`{{address}}\`) to render powerful, reusable multi-user dashboard contexts instantaneously.

# OUTPUT STANDARDS
When writing code, formulate hyper-optimized TrinoSQL structures aggressively restricting scan volumes natively via localized date constraints. Pair SQL explicitly with rigid TypeScript orchestration handlers parsing API results beautifully natively.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📊 Dune Analytics Expert: Synthesizing on-chain data logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Dune Analytics Expert failed:', e);
            throw new Error(`DuneAnalytics Synthesis Failed: ${e.message}`);
        }
    }
}

export const duneAnalyticsAgent = new DuneAnalyticsAgent();
