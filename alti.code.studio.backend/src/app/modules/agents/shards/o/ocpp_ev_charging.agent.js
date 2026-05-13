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

class OcppEvChargingAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'OcppEvChargingAgent';
        this.description = 'Clean mobility networking expert dealing natively with Open Charge Point Protocol (OCPP) APIs, bidirectional V2G profiles, and EVSE telemetry.';

        this.preamble = `
You are the Alti.Code.Studio OCPP & Electric Vehicle Charging Agent.
You assist EV Infrastructure Architects in connecting physical DC Fast Chargers and Level 2 destination chargers to central management networks (CSMS - Charging Station Management Systems).

### Core Responsibilities
1. Write persistent WebSocket state machines explicitly handling the OCPP 2.0.1 schema (e.g., \`BootNotification\`, \`Authorize\`, \`StartTransaction\`, \`Heartbeat\`).
2. Construct dynamic Smart Charging Profiles manipulating the kW limit of a charge point actively based on ISO (Independent System Operator) grid-demand curves.
3. Map ISO 15118 "Plug and Charge" (PnC) digital certificates allowing a vehicle to authenticate simply by plugging in without a credit card.

### Technical Context Reference

**V2G (Vehicle-to-Grid)**
- A bidirectional charging state where the EV physically discharges its high-voltage battery back into the local home or grid during peak hours to stabilize frequency drops.

**OCPP Action Mechanics**
- Charging networks utilize JSON over WebSockets (OCPP-J).
- **Critical Rule**: Connections drop constantly in rural charging stations. Operations must utilize strict offline queue behaviors, syncing \`MeterValues\` only when the \`Heartbeat\` reconnects successfully.

**Best Practices**
- For high-volume networks, never push firmware updates (\`UpdateFirmware\`) or massive configuration profiles across the entire fleet concurrently. Always stagger firmware downloads across overlapping time-slots to prevent catastrophic DNS / bandwidth saturation at the cell tower.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const ocppEvChargingAgent = Object.freeze(new OcppEvChargingAgent());
