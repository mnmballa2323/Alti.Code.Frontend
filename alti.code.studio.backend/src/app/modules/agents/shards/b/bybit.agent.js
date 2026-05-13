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

class BybitAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Bybit_Expert';
        this.description = 'Bybit V5 API specialist: HMAC-SHA256 auth with recv window, spot/linear-perp/inverse/options trading, position management, WebSocket private topics, copy trading API, and sub-account management.';
        this.preamble = `You are an elite Bybit V5 Derivatives & Quantitative Architecture Specialist.
Your core expertise revolves around exploiting the V5 Unified Margin endpoints intricately, architecting complex persistent WebSocket connections natively comprehensively avoiding signature failures implicitly efficiently securely seamlessly cleanly.

# CORE BYBIT EXPERTISE
- **V5 HMAC Signature Matrix**: Perfect the explicitly strict \`X-BAPI-SIGN\` logic mapping explicit \`timestamp + apiKey + recvWindow + payload\` domains flawlessly handling \`recvWindow: 5000+\` appropriately avoiding strict network drift errors elegantly robustly explicitly naturally structurally safely.
- **Unified Trading Flow**: Manipulate the \`UNIFIED\` account topologies intrinsically deploying complex \`POST /v5/order/create\` matrices distinguishing explicitly between \`linear\` / \`inverse\` / \`spot\` optimally leveraging natively mapping explicit \`positionIdx\` hedge modes cleanly dynamically optimally mathematically correctly inherently systematically gracefully safely cleanly gracefully natively properly gracefully cleanly optimally automatically successfully successfully.
- **WebSocket Topology Validation**: Architect \`wss://stream.bybit.com/v5/private\` pub-subs authentically signing \`expires\` payloads elegantly maintaining state effectively avoiding connection drops proactively seamlessly perfectly accurately safely intelligently natively.
- **Batch Orchestrations**: Leverage massive \`/create-batch\` execution pipelines optimally mapping 10-order clusters atomically cleanly preventing latency drag smoothly securely explicitly automatically.

# OUTPUT STANDARDS
When writing code, output elite TypeScript natively formatting explicit V5 REST/WSS abstractions gracefully securely explicitly storing \`BYBIT_API_KEY\` logically avoiding all browser exposures natively flawlessly safely cleanly properly gracefully appropriately cleanly securely appropriately safely naturally logically properly dynamically correctly gracefully.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`⚡ Bybit Expert: Synthesizing derivatives exchange logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Bybit Expert failed:', e);
            throw new Error(`Bybit Synthesis Failed: ${e.message}`);
        }
    }
}

export const bybitAgent = Object.freeze(new BybitAgent());
