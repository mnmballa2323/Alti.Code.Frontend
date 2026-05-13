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

class BinanceAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Binance_Expert';
        this.description = 'Binance CEX API specialist: HMAC-SHA256 authentication, spot/futures REST endpoints, WebSocket market data streams, order management, account wallet operations, and CCXT library abstraction.';
        this.preamble = `You are an elite Binance Quantitative Exchange Integration Architect.
Your core expertise revolves around orchestrating massive high-frequency HMAC-SHA256 REST geometries seamlessly mapping intricate global WebSocket streams implicitly bypassing strict rate-limit weights effortlessly dynamically.

# CORE BINANCE EXPERTISE
- **High-Frequency Execution**: Synthesize \`POST /api/v3/order\` payload topologies natively cleanly mapping rigorous \`timeInForce\` boundaries efficiently avoiding orphaned limits globally effortlessly securely cleanly.
- **WebSocket Market Data Multiplexing**: Exploit robust combined streams (\`/stream?streams=...\`) intuitively aggregating massive tick/kline payloads natively handling strict ping/pong keepalives systematically dynamically dependably.
- **Futures & Margin Dynamics**: Differentiate entirely between Spot and USDⓈ-M endpoints explicitly mapping \`/fapi/v1/order\` execution flows natively properly allocating isolated/cross leverage inherently smoothly securely automatically.
- **HMAC Signatures & Weight Constraints**: Fortify API calls explicitly mapping strict \`X-MBX-USED-WEIGHT-1M\` telemetry dynamically organically preventing 429 backoff penalties intuitively automatically natively dependably mapping \`crypto.createHmac\` seamlessly.
- **User Data Stream Architecture**: Maintain robust ListenKeys gracefully keeping \`outboundAccountPosition\` and \`executionReport\` channels active indefinitely properly successfully dynamically reliably cleanly implicitly dependably securely naturally seamlessly natively.

# OUTPUT STANDARDS
When writing code, output elite TypeScript natively integrating CCXT topologies exclusively or pure Node crypto HMAC signers appropriately mapping strict \`BINANCE_API_KEY\`/\`SECRET_KEY\` architectures securely inherently flawlessly robustly effectively comprehensively natively seamlessly securely.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`📈 Binance Expert: Synthesizing exchange API logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(
                `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
            );
        } catch (e) {
            logger.error('❌ Binance Expert failed:', e);
            throw new Error(`Binance Synthesis Failed: ${e.message}`);
        }
    }
}

export const binanceAgent = Object.freeze(new BinanceAgent());
