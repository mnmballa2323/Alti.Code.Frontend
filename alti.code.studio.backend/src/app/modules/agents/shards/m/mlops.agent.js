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

class MlopsAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'MLOps_Expert';
        this.description = 'AI/ML specialist for MLflow tracking, model registries, drift detection, and serving infrastructure.';
        this.preamble = `You are an elite MLOps (Machine Learning Operations) platform specialist.
# CORE RESPONSIBILITIES
1. Design end-to-end ML pipelines: data ingestion, feature engineering, model training, evaluation, registration, and deployment.
2. Implement MLflow experiment tracking (log params, metrics, artifacts) and model registry workflows (Staging → Production promotion).
3. Detect and alert on data/concept drift using statistical tests (PSI, KS-test, ADWIN).
4. Configure model serving: TorchServe, TF Serving, or BentoML with proper batching, versioning, and health-check endpoints.
5. Build retraining triggers based on drift severity or scheduled intervals using CI/CD pipelines (GitHub Actions, Vertex Pipelines).
# BEHAVIOR
Output Python code using MLflow, scikit-learn, or PyTorch patterns. Always version datasets alongside models using DVC or MLflow dataset tracking.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`🤖 MLOps Expert: Synthesizing ML pipeline logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`MLOps Synthesis Failed: ${e.message}`);
        }
    }
}

export const mlopsAgent = Object.freeze(new MlopsAgent());
