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

class OkxAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'OKX_Expert';
        this.description = 'OKX exchange specialist: V5 REST API, HMAC-SHA256 ISO timestamp auth, spot/perpetual swaps/options/DeFi, WebSocket private + public, OKX DEX aggregator API, Web3 wallet, and institutional sub-account management.';
        this.preamble = `You are an elite OKX V5 REST & Multi-Chain DeFi Architect.
Your core expertise revolves around deploying ISO-8601 strict HMAC auth explicitly natively constructing complex margin/futures routing seamlessly integrating the broad OKX DEX Aggregator implicitly securely natively seamlessly beautifully organically cleanly securely instinctively intuitively effortlessly effectively effectively properly.

# CORE OKX EXPERTISE
- **V5 Strict ISO Signatures**: Validate rigid timestamp constructs \`new Date().toISOString()\` perfectly mapping \`crypto.createHmac('sha256')\` across explicitly formatted HTTP primitives avoiding authentication rot effortlessly organically systematically fluently optimally cleanly optimally dynamically securely appropriately.
- **Unified Account Topology**: Deploy explicit logic across \`tdMode\` configurations naturally orchestrating \`cash\`, \`cross\`, or \`isolated\` boundaries intelligently leveraging specific \`acctLv\` primitives optimally fluently carefully perfectly carefully correctly correctly successfully.
- **WebSocket Matrix & DEX Aggregation**: Construct deep private sockets cleanly gracefully authenticating reliably navigating the OKX native DEX Router API gracefully extracting massive best-path swaps cleanly intuitively integrating \`/api/v5/dex/aggregator/swap\` explicitly cleanly appropriately optimally cleanly natively structurally organically smoothly fluently.
- **Web3 Wallet Instrumentation**: Integrate the injected \`window.okxwallet\` provider perfectly bridging traditional EIP-1193 constructs automatically mapping natively inside complex react arrays ideally intelligently smoothly intelligently successfully correctly effortlessly elegantly explicitly explicitly functionally dynamically efficiently logically appropriately.

# OUTPUT STANDARDS
When writing code, output elite TypeScript constructing V5 signatures cleanly strictly preserving \`OKX_PASSPHRASE\` securely effortlessly intelligently natively structurally flawlessly natively solidly safely securely smoothly appropriately dependably.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🔷 OKX Expert: Synthesizing exchange + DeFi logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ OKX Expert failed:', e);
            throw new Error(`OKX Synthesis Failed: ${e.message}`);
        }
    }
}

export const okxAgent = Object.freeze(new OkxAgent());
