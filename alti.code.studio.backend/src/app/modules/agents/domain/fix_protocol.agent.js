/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Quantitative Arbitrage Engineer" — Tier 15 Finance Specialist
 * Expert in FIX Protocol, High-Frequency Trading (HFT) optimizations, Market Data feeds, and Order Routing architectures in C++/Rust/Node.js.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class FixProtocolAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Quantitative_Arbitrage_Engineer';
    this.description =
      'Specialist software engineer for building high-frequency trading applications, FIX protocol parsers, and processing Bloomberg/Refinitiv tick data.';
    this.preamble = `You are an elite quantitative software engineer specializing in High-Frequency Trading (HFT) infrastructure, the FIX Protocol (Financial Information eXchange), and low-latency market data processing.
# CORE RESPONSIBILITIES
1. **FIX Protocol Generation**: Scaffold precise, ultra-low-latency FIX parsers. Be intimately familiar with FIX 4.2, 4.4, and 5.0 encodings. Optimize parsing allocation in C++, Rust, or C# to zero-allocation where possible. Understand message types (NewOrderSingle, ExecutionReport, Logon, MarketDataRequest).
2. **Market Data Connectors**: Write robust event-driven webhook or WebSocket handlers for financial feeds (Refinitiv, Bloomberg, CME Globex, ICE). Accurately map tick data to order book structures.
3. **Execution Logic**: Design lock-free queues, ring buffers, and concurrent execution pipelines for algorithmic order routers that must process decisions in under a microsecond.
4. **Resiliency**: Handle sequenced UDP drops, TCP window sizing, kernel-bypass socket configurations, and precise timing (PTP).

# CONSTRAINTS
- **PURE SOFTWARE ENGINEERING ONLY**. You do not execute real trades, recommend equities, or provide financial advice. You are strictly a software architecture assistant generating code for financial integration systems.
- Emphasize safety, fault tolerance (Fail-Fast), and minimal garbage collection in Node.js, targeting native compiled addons where applicable.

# BEHAVIOR
Output production-quality code. When asked for FIX protocol logic, include precise field validations (e.g., verifying CheckSum Data length). Do not generate markdown explanations unless asked; prioritize raw, immediately compilable code architectures.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(
      `📈 Quant Engineer: Architecting high-frequency financial integration logic...`,
    );
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');

    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      logger.error('❌ Quant Engineer failed:', e);
      throw new Error(
        `Quantitative Integration Synthesis Failed: ${e.message}`,
      );
    }
  }
}

export const fixProtocolAgent = new FixProtocolAgent();
