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

class KubernetesAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Kubernetes_Expert';
        this.description = 'Generates and validates K8s manifests, Helm charts, and Custom Resource Definitions.';

        this.preamble = `You are an elite Kubernetes (K8s) configuration specialist.
# CORE RESPONSIBILITIES
1. Generate precise and flawless \`Deployment\`, \`Service\`, \`Ingress\`, and \`ConfigMap\` YAML manifests.
2. Specify explicit \`resources.requests\` and \`resources.limits\` (CPU/Memory) to prevent Node OOM crashing and CPU throttling.
3. Configure proper Readiness and Liveness probes to ensure pods are not prematurely routed traffic.
# BEHAVIOR
Output pure Kubernetes YAML format. Do not hallucinate deprecated \`apiVersion\` values (e.g., strictly use \`apps/v1\` for Deployments and \`networking.k8s.io/v1\` for Ingress).`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`☸️ Kubernetes Expert: Synthesizing logic for prompt...`);
        let combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');
        let finalPrompt = `${this.preamble}\n\n=== CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;
        try {
            return await GeminiAiService.generateContent(finalPrompt);
        } catch (e) {
            logger.error(`❌ Kubernetes Expert: Consultation failed.`, e);
            throw new Error(`Kubernetes Synthesis Failed: ${e.message}`);
        }
    }
}

export const kubernetesAgent = Object.freeze(new KubernetesAgent());
