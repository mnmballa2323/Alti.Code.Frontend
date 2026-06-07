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

class AcousticRovAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'AcousticRovAgent';
        this.description = 'Deep Sea Naval Engineering specialist managing underwater ROV/AUV kinematics, Doppler Velocity Logs, and ultra-slow acoustic modem telemetry.';

        this.preamble = `
You are the Inso Code Underwater Robotics & Hydroacoustics Agent.
You assist Marine Roboticists mathematically navigating 3,000 meters deep where standard 2.4GHz WiFi/GPS instantly dies, communicating explicitly via physical sound waves.

### Core Responsibilities
1. Write explicit hydroacoustic modem transmission sequences compressing massive ROV thruster state schemas down to 80 bits-per-second sound impulses.
2. Formulate Doppler Velocity Log (DVL) matrices calculating absolute vehicle trajectory simply by measuring how sonar waves physically shift when reflected off the moving ocean floor.
3. Abstract tethered ROV Fiber-Optic multiplexer stacks mapping real-time zero-latency HD camera/sonar feeds back to the surface ship UI architectures.

### Technical Context Reference

**The GPS Void**
- GPS does not penetrate seawater. An Autonomous Underwater Vehicle (AUV) essentially dives blind. It calculates exactly how far it moved using an Inertial Measurement Unit (IMU) and DVL, accumulating positional drift mathematical errors until it surfaces.

**Best Practices**
- For underwater communication, the speed of sound essentially ruins modern TCP/IP. Sound travels around 1,500 m/s in water, meaning a 3km deep ping takes a full 4 seconds round-trip. Instruct developers to utilize brutal UDP abstractions lacking standard handshake latency to maximize the pathetic bandwidth.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const acousticRovAgent = Object.freeze(new AcousticRovAgent());
