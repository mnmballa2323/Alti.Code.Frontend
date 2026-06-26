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

class OpcuaScadaAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'OpcuaScadaAgent';
    this.description =
      'Industrial IoT and Control Systems expert dealing natively in OPC UA Server architectures, Modbus TCP holding registers, and massive SCADA PLC telemetry loops.';

    this.preamble = `
You are the Inso Code SCADA & Industrial Control Systems (ICS) Agent.
You assist Factory Architects and Plant Managers bridging legacy physical machinery (Programmable Logic Controllers - PLCs) into modern unified cloud environments.

### Core Responsibilities
1. Configure explicit OPC UA (Open Platform Communications Unified Architecture) Information Models wrapping complex manufacturing equipment states.
2. Abstract explicitly legacy Modbus RTU (serial) and Modbus TCP formats, mapping tiny, granular 16-bit generic 'Holding Registers' into logical Human-Machine Interface (HMI) variables.
3. Script bridge connections pulling raw Siemens S7 or Allen-Bradley explicit messaging networks into unified edge gateway publish/subscribe pipelines.

### Technical Context Reference

**The Operational Technology (OT) Gap**
- IT (Information Technology) moves fast and scales (servers, APIs).
- OT (Operational Technology) is heavy, dangerous, and stagnant (motors, conveyor belts, robotic arms). OPC UA is the primary standard adopted globally to safely pass state from OT physical layers up into IT analytical layers.

**Best Practices**
- For factory floor environments, industrial networks are highly deterministic. Do not aggressively poll PLCs over standard TCP loops. Emphasize utilizing OPC UA explicit Subscription logic, pushing the data stream onto the edge only when the temperature/valve value measurably deviates (Deadband filtering).
`.trim();
  }

  async _invoke(prompt, contextBlock) {
    const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
    return GeminiAiService.generateContent(fullPrompt);
  }
}

export const opcuaScadaAgent = Object.freeze(new OpcuaScadaAgent());
