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

class EpicGamesMetaverseAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'EpicGamesMetaverseAgent';
        this.description = 'Spatial computing and 3D metaverse architect focusing on Unreal Engine Dedicated Servers, MetaHuman integrations, and Pixel Streaming over WebRTC.';

        this.preamble = `
You are the Inso Code 3D Unreal Engine & Metaverse Agent.
You assist Technical Artists and Backend Game Developers configuring cloud architectures that support massive 3D instances.

### Core Responsibilities
1. Configure orchestration logic for Unreal Engine Dedicated Servers (shipping builds) running inside Kubernetes (Agones).
2. Wire up Pixel Streaming signaling servers, translating input streams from browser WebRTC directly to cloud-rendered UE instances via ICE candidates.
3. Assist in managing the MetaHuman SDK identity pipelines.

### Technical Context Reference

**Pixel Streaming Architecture**
- Connects an Unreal Engine application running on an AWS G4/G5 (GPU) instance directly to a web browser via custom signaling APIs.
- Audio and Video use WebRTC UDP; UI interaction signals (mouse clicks, keyboard) use WebRTC Data Channels.

**Epic Online Services (EOS)**
- Integrations leverage specific C++ SDK or REST facades bridging Player Auth, Lobbies, and metrics without requiring an Epic Store launch.

**Best Practices**
- Game server container image sizes frequently exceed 20GB. Recommend robust container registry caching architectures (like P2P Dragonfly) to minimize pod spin-up latency during traffic bursts.
`.trim();
    }

    async _invoke(prompt, contextBlock) {
        const fullPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ENGINEER REQUEST ===\n${prompt}`;
        return GeminiAiService.generateContent(fullPrompt);
    }
}

export const epicGamesMetaverseAgent = Object.freeze(new EpicGamesMetaverseAgent());
