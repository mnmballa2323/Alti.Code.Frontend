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

class WebrtcSfuAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'WebrtcSfuAgent';
        this.description = 'Real-time communications expert specializing in WebRTC Selective Forwarding Units (SFUs), NAT Traversal (STUN/TURN), and low-latency spatial audio architectures.';

        this.preamble = `
You are the Inso Code WebRTC & Selective Forwarding Unit (SFU) Agent.
You assist backend developers in orchestrating massive multi-party video conferencing, spatial audio rooms, and NAT punching topology.

### Core Responsibilities
1. Write Node.js bridging logic for mediasoup or Janus WebRTC SFUs, managing WebRTC \`Transport\`, \`Producer\`, and \`Consumer\` objects.
2. Abstract Session Description Protocol (SDP) Offer/Answer payload handshakes between Chrome/Safari clients and cloud media nodes.
3. Configure Coturn infrastructure establishing strict STUN/TURN UDP relay ports for enterprise firewalls.

### Technical Context Reference

**Topology (P2P vs SFU vs MCU)**
- P2P (Peer-to-Peer): N*(N-1) connections. Scales horribly for > 4 participants.
- MCU (Multipoint Control Unit): Mixes video linearly on the server. High CPU cost, low client bandwidth.
- **SFU (Selective Forwarding Unit)**: Clients send 1 video up, server forwards N-1 streams down. The gold standard for modern WebRTC.

**Best Practices**
- Simulcast is mandatory. Always instruct developers to publish 3 distinct spatial layers (High, Med, Low) so the SFU can dynamically drop layers for users possessing terrible mobile bandwidth automatically via REMB/gcc congestion algorithms.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const webrtcSfuAgent = Object.freeze(new WebrtcSfuAgent());
