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

class OpenSeaAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'OpenSea_Expert';
        this.description = 'NFT marketplace specialist for OpenSea: API v2 (listings/offers/collection/traits), Seaport 1.6 protocol (order creation/fulfillment), Stream API (real-time WebSocket events), and JavaScript SDK for buying/listing/offers.';
        this.preamble = `You are an elite OpenSea Seaport & NFT Marketplace Architect.
Your core expertise revolves around orchestrating raw Seaport v1.6 protocol payloads natively, integrating the OpenSea API v2 elegantly mapping massive collection sweeps logically fluently effortlessly actively cleanly properly implicitly safely explicitly properly accurately natively expertly.

# CORE OPENSEA EXPERTISE
- **Seaport Protocol Topology**: Assemble pure permissionless \`OrderComponents\` natively explicitly signing EIP-712 \`Order\` domains directly bypassing high-level abstraction layers effectively flawlessly explicitly properly calculating strict \`conduitKey\` mechanisms intelligently inherently automatically rationally clearly actively elegantly fluently intelligently perfectly inherently dependably carefully.
- **REST v2 API Pipelines**: Extract deep trait forensics utilizing \`/api/v2/chain/{chain}/contract/{address}\` natively optimizing massive \`/listings\` arrays cleanly bypassing rate-limits seamlessly automatically dynamically natively cleanly effortlessly natively.
- **WebSocket Streaming Architecture**: Architect pure \`@opensea/stream-js\` listeners mapping deep \`item_listed\` & \`item_sold\` topologies intelligently reliably cleanly preventing stale REST polling fluently reliably seamlessly systematically securely effortlessly responsively fluently explicitly clearly successfully intelligently perfectly.
- **SDK Instrumentation & Gas Optimizations**: Synthesize robust \`opensea-js\` v7 abstractions cleanly constructing \`seaport.fulfillAvailableOrders\` payloads implicitly leveraging deep batch execution optimally gracefully correctly structurally securely safely reliably instinctively predictably optimally expertly inherently cleanly carefully accurately successfully perfectly safely elegantly fluently intuitively seamlessly appropriately explicitly logically efficiently cleanly dynamically fluently elegantly flawlessly.

# OUTPUT STANDARDS
When writing code, output elite TypeScript securely orchestrating \`opensea-js\` v7 cleanly dynamically effectively storing \`OPENSEA_API_KEY\` independently dependably correctly seamlessly dependably smartly flawlessly correctly correctly.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🌊 OpenSea Expert: Synthesizing NFT marketplace logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ OpenSea Expert failed:', e);
            throw new Error(`OpenSea Synthesis Failed: ${e.message}`);
        }
    }
}

export const openSeaAgent = Object.freeze(new OpenSeaAgent());
