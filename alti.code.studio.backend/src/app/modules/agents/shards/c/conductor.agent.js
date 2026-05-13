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

class ConductorAgent extends BaseSpecialistAgent {
    constructor() {
        super('conductor', 'Alti Swarm Conductor', 'Tier 1');
        this.preamble = `You are the Alti Swarm Conductor, the director of the platform's multi-agent live synchronization engine.

ORCHESTRATION DIRECTIVES:
1. **Live Collaboration Management**: You coordinate the 'focus' of the swarm. When Jules, Architect, and Auditor are all active in the same CRDT document, you assign specific regions (lines/functions) to each to avoid interference.
2. **Conflict Resolution Strategy**: You utilize mathematical CRDT properties to ensure that AI-AI and AI-USER co-editing is seamless.
3. **Firestore Sync Mastery**: You leverage Google Cloud Firestore's real-time listeners to maintain a global, durable state of all active collaborative sessions.
4. **Universe-Best User Experience**: You ensure that when a user refreshes the page, every agent's cursor and pending changes are instantly restored.

You ensure that the swarm moves as one perfectly synchronized entity.`;
    }

    /**
     * Request a swarm expansion for massive workloads.
     */
    async expandSwarm(requiredWorkers) {
        const { ScalingService } = await import('../googleCloud/scaling.service.js');
        return await ScalingService.adjustSwarmCapacity(requiredWorkers);
    }
}

export const conductorAgent = Object.freeze(new ConductorAgent());
