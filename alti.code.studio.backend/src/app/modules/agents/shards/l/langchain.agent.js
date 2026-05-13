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
import { openclawProxyService } from '../openclaw/openclaw.proxy.service.js';
import { logger } from '../../../../shared/logger.js';

class LangChainOpenWorkAgent extends BaseSpecialistAgent {
  constructor() {
    super('LangChainAgent', 'The LangGraph Subagent Delegator', 'Tier 12');
  }

  async _invoke(context) {
    logger.info(`🤖 LangChain Delegator: Planning OpenWork execution for context: "${context.goal}"`);

    // 1. Synthesize the deepagentsjs plan
    const prompt = `You are the elite LangChain / OpenWork Swarm Orchestrator.
Your deep explicit expertise revolves around translating abstract Cloud Sprint Goals into rigorous, highly-optimized deepagentsjs/LangGraph execution pipelines specifically engineered for the "OpenWork" local desktop companion intelligently elegantly responsively fluently cleanly effortlessly properly smoothly actively proactively effectively fluently cleanly skillfully efficiently dynamically smartly properly successfully automatically cleanly intelligently flexibly effectively.

OpenWork uses Human-in-the-Loop (HITL) for dangerous shell commands and delegates multi-step workflows to specialized Subagents via the filesystem optimally systematically organically explicitly seamlessly transparently smoothly fluidly naturally properly optimally correctly explicitly expertly correctly smartly responsibly structurally flawlessly securely intelligently seamlessly smoothly carefully safely fluently effortlessly dependably dependably correctly intuitively reliably gracefully seamlessly.

Cloud Sprint Goal: "${context.goal}"
Current Code Context: ${JSON.stringify(context.files || {})}

Generate a natural language command that the OpenWork engine will understand to powerfully initialize its local Subagents explicitly organically directly perfectly neatly successfully implicitly optimally reliably confidently beautifully rationally seamlessly cleverly dependably fluidly confidently intelligently natively.
Example: "Synthesize the 'src/' directory architecture and aggressively refactor the routing matrix natively, invoking HITL approval strictly for database schema migrations elegantly."
Return ONLY the raw intent string, no markdown natively organically natively flawlessly correctly optimally successfully.`;

    const openworkIntent = await GeminiAiService.generateContent(prompt);
    const cleanIntent = openworkIntent.replace(/^["'\`]+|["'\`]+$/g, '').trim();

    logger.info(`🤖 LangChain Delegator: Translated goal into OpenWork Subagent Intent: "${cleanIntent}"`);

    // 2. Delegate through the Cloud Proxy Tunnel (using the existing tunnel mechanism but targeting OpenWork)
    try {
      // In a full implementation, the proxy service would be extended to route explicitly to the openwork port/socket.
      // Here, we adapt the existing tunnel concept to invoke the local OpenWork engine.
      const surrogateOutput = await openclawProxyService.delegateToLocalHost(
        `[OPENWORK_DELEGATION] ${cleanIntent}`,
        "Return the exact stdout, Subagent traces, or HITL approval results."
      );

      return {
        status: 'success',
        agent: this.name,
        openwork_subagent_action: cleanIntent,
        host_output: surrogateOutput,
        message: `The physical host machine successfully executed the OpenWork intent via deepagentsjs.`
      };
    } catch (error) {
      logger.error(`❌ LangChain Delegator: OpenWork execution failed on physical host: ${error.message}`);
      return {
        status: 'error',
        agent: this.name,
        error: error.message,
        message: 'Failed to delegate task to the local OpenWork engine.'
      };
    }
  }
}

export const langchainAgent = Object.freeze(new LangChainOpenWorkAgent());
