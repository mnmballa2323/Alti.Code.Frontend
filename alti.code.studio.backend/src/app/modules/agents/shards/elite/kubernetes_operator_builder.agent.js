// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Sovereign Elite Specialist Agent
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class KubernetesOperatorBuilderAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'kubernetes_operator_builder',
            'Kubernetes Operator Builder',
            'You are an elite Kubernetes Operator Specialist. You write Go-based Custom Resource Definitions (CRDs) and Operator controllers using Kubebuilder for autonomous orchestration.'
        );
    }

    async generateOperator(objective) {
        logger.info(`☸️ [KubernetesOperatorBuilderAgent] Building K8s Operator CRDs...`);
        const prompt = `Design and implement the Kubernetes Operator requirement: ${objective}. Output valid Go/Kubebuilder logic and YAML CRDs for autonomous orchestration.`;
        try {
            const output = await this._invoke(prompt, "N/A - K8s Operator Target");
            return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
        } catch (err) {
            logger.error(`❌ [KubernetesOperatorBuilderAgent] Failed: ${err.message}`);
            throw err;
        }
    }
}
export const kubernetesOperatorBuilderAgent = Object.freeze(new KubernetesOperatorBuilderAgent());
