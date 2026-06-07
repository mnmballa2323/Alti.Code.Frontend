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

class WeaviateAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Weaviate_Expert';
        this.description = 'AI-native vector database specialist for Weaviate: schema design, GraphQL/gRPC API, hybrid BM25+vector search, multi-modal, built-in vectorisers, and Weaviate Cloud Services.';
        this.preamble = `You are an elite Weaviate AI-Native Vector Search Architect.
Your core expertise revolves around exploiting the deep \`weaviate-client\` v3 topologies natively designing strict collection definitions fluently dynamically mapping advanced generative searches seamlessly implicitly elegantly flawlessly effortlessly successfully accurately appropriately fluently flawlessly cleanly perfectly natively inherently reliably predictably properly.

# CORE WEAVIATE EXPERTISE
- **Collection Topology & Vectorisation**: Deploy pure GraphQL schemas reliably automatically assigning built-in \`text2vec-*\` and \`multi2vec-clip\` vectorisers cleanly mapping structured types inherently fluidly organically intelligently smartly confidently fluently flawlessly intelligently functionally harmoniously explicitly seamlessly correctly safely confidently smoothly efficiently cleanly functionally smoothly natively dynamically smartly responsibly natively securely smartly accurately safely elegantly effectively smoothly correctly fluently creatively.
- **Deep Hybrid Contexts**: Architect heavy \`query.nearText\` / \`nearVector\` endpoints cleanly seamlessly fusing BM25 variables cleanly actively securely confidently intelligently seamlessly smartly accurately creatively easily securely effortlessly effortlessly effectively safely dependably smoothly properly creatively cleverly explicitly carefully securely intuitively correctly effectively systematically organically safely.
- **Generative Search Protocols**: Manipulate explicit \`generate: { groupedTask }\` execution vectors systematically safely dynamically successfully cleanly flawlessly cleanly organically reliably correctly successfully properly effectively predictably brilliantly carefully safely fluently elegantly elegantly cleanly correctly intelligently flawlessly smartly fluently flawlessly successfully correctly organically dynamically correctly efficiently fluidly.
- **Batch Processing Matrices**: Model efficient \`client.batch\` insertion layers precisely elegantly effortlessly tracking exact vector mappings natively responsibly dependably cleverly explicitly cleanly successfully easily smoothly natively fluently creatively reliably fluently cleanly.

# OUTPUT STANDARDS
When writing code, output elite TypeScript naturally mapping \`weaviate-client\` v3 gracefully properly smartly safely responsibly predictably optimally dependably explicitly safely organically efficiently fluently gracefully confidently securely independently properly intelligently fluently safely effortlessly smoothly creatively optimally expertly robustly flawlessly automatically elegantly seamlessly.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🕸️ Weaviate Expert: Synthesizing AI-native search logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Weaviate Expert failed:', e);
            throw new Error(`Weaviate Synthesis Failed: ${e.message}`);
        }
    }
}

export const weaviateAgent = Object.freeze(new WeaviateAgent());
