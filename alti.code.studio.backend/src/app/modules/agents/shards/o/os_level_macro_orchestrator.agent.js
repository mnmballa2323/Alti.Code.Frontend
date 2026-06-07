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
import { openclawProxyService } from '../openclaw/openclaw.proxy.service.js';
import { logger } from '../../../../shared/logger.js';

class OsLevelMacroOrchestratorAgent extends BaseSpecialistAgent {
    constructor() {
        super('OsLevelMacroOrchestratorAgent', 'Os Level Macro Orchestrator Agent', 'Tier 10+');
        this.preamble = `You are the OS-Level Macro Orchestrator (Phase 28.0.0 & Phase 40.0.0).

You represent the physical hands of the AI ecosystem. You take high-level semantic intents and convert them into native Windows/macOS physical execution events or physical Hardware Actuation intents (Phase 40).

CRITICAL DIRECTIVES:
1. **Hardware-Level Event Sinking**: You rely on low-level system hooks. You generate literal mouse pointer movement arcs, scroll-wheel detents, and precise keyboard keystrokes.
2. **Phase 40 Hardware Actuation**: You can send direct intents to the OpenClaw Surrogate Daemon via the proxy tunnel to physically manipulate the host machine (e.g., WIFI_TOGGLE, BLUETOOTH_DISCONNECT, DISPLAY_SLEEP).
3. **Execution Verification Loop**: You never click blind. After executing an OS level macro click, you immediately query the Swarm's "eyes" (Vision or Semantic agents) to verify the desktop state changed.
`;
    }

    async _invoke(query, args = {}) {
        let executionStatus = "PENDING";
        let openClawResult = null;

        // Detect Hardware Actuation Intent from natural language query
        const qLower = query.toLowerCase();

        let hardwareIntent = null;
        if (qLower.includes('wifi') || qLower.includes('network')) {
            hardwareIntent = { domain: "hardware", action: "TOGGLE_WIFI", value: args.toggleState || "ON" };
        } else if (qLower.includes('bluetooth') || qLower.includes('bt')) {
            hardwareIntent = { domain: "hardware", action: "TOGGLE_BLUETOOTH", value: args.toggleState || "ON" };
        } else if (qLower.includes('display') || qLower.includes('monitor')) {
            hardwareIntent = { domain: "hardware", action: "SET_DISPLAY_STATE", value: args.displayState || "SLEEP" };
        } else {
            // Standard OS Macro Mouse/Keyboard payload
            hardwareIntent = { domain: "macro", action: "EXECUTE_SEQUENCE", sequence: args.sequence || query };
        }

        try {
            logger.info(`[Phase 40] OS-Level Macro Orchestrator delegating intent to OpenClaw: ${hardwareIntent.action}`);
            openClawResult = await openClawProxyService.delegate(hardwareIntent);

            executionStatus = "SUCCESS";
        } catch (e) {
            logger.error(`[Phase 40] OpenClaw delegation failed: ${e.message}`);
            executionStatus = "FAILED";
            openClawResult = { error: e.message };
        }

        return {
            telemetry: {
                agent: this.name,
                model: this.defaultModel,
                event: 'SURROGATE_DELEGATION',
                status: executionStatus,
                timestamp: new Date().toISOString()
            },
            data: {
                intent: hardwareIntent,
                targetOsPayload: openClawResult
            },
            narrative: executionStatus === "SUCCESS"
                ? `Successfully routed the physical hardware intent [${hardwareIntent.action}] through the OpenClaw Daemon.`
                : `Failed to execute hardware intent: ${openClawResult?.error}`
        };
    }
}

export const osLevelMacroOrchestratorAgent = Object.freeze(new OsLevelMacroOrchestratorAgent());
